import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const API_SECRET = process.env.SELCOM_API_SECRET;

// Verifies the Digest header Selcom sends matches an HMAC-SHA256 of the
// raw JSON body fields, signed with our API Secret — proves the request
// really came from Selcom and wasn't forged.
function verifySignature(bodyObject, digestHeader, signedFieldsHeader) {
  if (!digestHeader || !signedFieldsHeader) return false;
  const fields = signedFieldsHeader.split(",");
  const signingString = fields.map((k) => `${k}=${bodyObject[k]}`).join("&");
  const expected = crypto.createHmac("sha256", API_SECRET).update(signingString).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(digestHeader));
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const digest = request.headers.get("digest");
    const signedFields = request.headers.get("signed-fields");

    if (!verifySignature(body, digest, signedFields)) {
      console.error("Selcom webhook: signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Selcom sends the order_id we originally supplied (our payment_reference)
    // and a result code / payment status field for the transaction.
    const paymentReference = body.order_id;
    const resultCode = String(body.result_code ?? body.resultcode ?? "");
    const transid = body.transid || body.reference || null;
    const isSuccess = resultCode === "000" || String(body.payment_status).toUpperCase() === "COMPLETED";

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("payment_reference", paymentReference)
      .single();

    if (!order) {
      console.error("Selcom webhook: no matching order for", paymentReference);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already processed — Selcom may retry webhooks, so make this idempotent.
    if (order.payment_status === "paid") {
      return NextResponse.json({ received: true });
    }

    if (isSuccess) {
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          selcom_transid: transid,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    } else {
      // Payment failed or was cancelled — release the reserved stock.
      await supabaseAdmin.rpc("restore_stock", {
        items: order.order_items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
      });
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", order.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Selcom webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
