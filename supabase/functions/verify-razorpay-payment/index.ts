import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID"),
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET"),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function verifyPaymentSignature(
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) {
  const hmac = crypto.createHmac(
    "sha256",
    Deno.env.get("RAZORPAY_KEY_SECRET")
  );
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === razorpaySignature;
}

Deno.serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      await req.json();

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const isSignatureValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== "captured") {
      return new Response(
        JSON.stringify({
          error: "Payment not captured",
          paymentStatus: payment.status,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract order ID from payment notes
    const noteOrderId = payment.notes?.orderId;

    if (!noteOrderId) {
      return new Response(
        JSON.stringify({ error: "Order ID not found in payment notes" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update order status in Supabase
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", noteOrderId)
      .select("id, status, total_amount_inr")
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order status" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: updatedOrder.id,
        transactionId: razorpayPaymentId,
        amount: updatedOrder.total_amount_inr,
        message: "Payment verified and order confirmed",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({
        error: "Payment verification failed",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
