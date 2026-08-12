import crypto from "crypto";

/**
 * Selcom API Gateway client.
 *
 * IMPORTANT: Selcom's exact header-signing implementation is not fully
 * published in open docs. This follows the pattern documented publicly
 * (Authorization / Digest-Method / Digest / Timestamp / Signed-Fields
 * headers, HMAC-SHA256 over "key=value" pairs joined with "&", using
 * your API Secret as the HMAC key). Test this against Selcom's SANDBOX
 * environment with your real sandbox credentials before going live —
 * if Selcom's support team gives you a different signing recipe, update
 * only the `computeHeaders` function below; nothing else needs to change.
 */

const useSandbox = process.env.SELCOM_USE_SANDBOX === "true";
const BASE_URL = useSandbox
  ? process.env.SELCOM_BASE_URL_SANDBOX
  : process.env.SELCOM_BASE_URL;

const API_KEY = process.env.SELCOM_API_KEY;
const API_SECRET = process.env.SELCOM_API_SECRET;
const VENDOR_ID = process.env.SELCOM_VENDOR_ID;

function selcomTimestamp() {
  // Selcom expects local (Tanzania, UTC+3) time in ISO-like format.
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return now.toISOString().replace("Z", "+03:00");
}

function computeHeaders(bodyObject) {
  const signedFields = Object.keys(bodyObject);
  const signingString = signedFields.map((k) => `${k}=${bodyObject[k]}`).join("&");
  const digest = crypto.createHmac("sha256", API_SECRET).update(signingString).digest("base64");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `SELCOM ${Buffer.from(API_KEY).toString("base64")}`,
    "Digest-Method": "HS256",
    Digest: digest,
    Timestamp: selcomTimestamp(),
    "Signed-Fields": signedFields.join(","),
  };
}

async function selcomRequest(path, method, bodyObject) {
  const headers = computeHeaders(bodyObject || {});
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: bodyObject ? JSON.stringify(bodyObject) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Selcom API error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Creates a Selcom checkout order. Returns { payment_gateway_url } which
 * you redirect the buyer to — it supports card, and mobile money
 * (M-Pesa, Tigo Pesa, Airtel Money) push payments.
 */
export async function createSelcomOrder({ orderId, amount, buyerName, buyerEmail, buyerPhone, itemCount }) {
  const body = {
    vendor: VENDOR_ID,
    order_id: orderId,
    buyer_email: buyerEmail || "buyer@harbor.co.tz",
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    amount: Math.round(amount),
    currency: "TZS",
    redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}?payment=return`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}?payment=cancelled`,
    webhook: `${process.env.NEXT_PUBLIC_SITE_URL}/api/selcom/webhook`,
    buyer_remarks: "Harbor order",
    merchant_remarks: "Harbor order",
    no_of_items: itemCount || 1,
  };

  return selcomRequest("/v1/checkout/create-order-minimal", "POST", body);
}

/** Polls Selcom for the current status of an order (used as a fallback to the webhook). */
export async function getSelcomOrderStatus(orderId) {
  return selcomRequest(`/v1/checkout/order-status?order_id=${orderId}`, "GET", { order_id: orderId });
}
