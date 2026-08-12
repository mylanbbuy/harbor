import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSelcomOrder } from "@/lib/selcom";

// Anon client used only to verify the buyer's access token server-side.
const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Your session has expired. Please log in again." }, { status: 401 });
    }
    const user = userData.user;

    const { items, customerName, customerPhone, customerEmail, deliveryAddress } = await request.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Re-price and validate against the database — never trust client-sent prices.
    const productIds = items.map((i) => i.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock, active")
      .in("id", productIds);

    if (productsError) throw productsError;

    let total = 0;
    const orderItemsPayload = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      if (!product || !product.active) {
        return NextResponse.json({ error: `A product in your cart is no longer available.` }, { status: 400 });
      }
      if (product.stock < item.qty) {
        return NextResponse.json({ error: `Not enough stock for "${product.name}". Only ${product.stock} left.` }, { status: 400 });
      }
      total += product.price * item.qty;
      orderItemsPayload.push({ product_id: product.id, product_name: product.name, price: product.price, qty: item.qty });
    }

    // 1. Create the order (pending / unpaid)
    const paymentReference = `HARBOR-${Date.now()}-${user.id.slice(0, 6)}`;
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: deliveryAddress,
        total,
        status: "pending",
        payment_status: "unpaid",
        payment_reference: paymentReference,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    // 2. Insert order items
    const itemsWithOrderId = orderItemsPayload.map((i) => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(itemsWithOrderId);
    if (itemsError) throw itemsError;

    // 3. Reserve stock immediately so two buyers can't oversell the same item
    // while this payment is pending. Restored automatically if payment fails.
    const { error: stockError } = await supabaseAdmin.rpc("decrement_stock", {
      items: orderItemsPayload.map((i) => ({ product_id: i.product_id, qty: i.qty })),
    });
    if (stockError) {
      await supabaseAdmin.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "One or more items sold out while you were checking out." }, { status: 409 });
    }

    // 4. Create the Selcom payment order
    let selcomResponse;
    try {
      selcomResponse = await createSelcomOrder({
        orderId: paymentReference,
        amount: total,
        buyerName: customerName || user.email,
        buyerEmail: customerEmail || user.email,
        buyerPhone: customerPhone,
        itemCount: orderItemsPayload.length,
      });
    } catch (selcomErr) {
      // Roll back the stock reservation if we couldn't even start payment.
      await supabaseAdmin.rpc("restore_stock", {
        items: orderItemsPayload.map((i) => ({ product_id: i.product_id, qty: i.qty })),
      });
      await supabaseAdmin.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Could not start payment. Please try again shortly." }, { status: 502 });
    }

    const gatewayUrl = selcomResponse?.data?.[0]?.payment_gateway_url || selcomResponse?.payment_gateway_url;

    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "processing", payment_gateway_url: gatewayUrl })
      .eq("id", order.id);

    return NextResponse.json({ orderId: order.id, paymentUrl: gatewayUrl });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Something went wrong while placing your order." }, { status: 500 });
  }
}
