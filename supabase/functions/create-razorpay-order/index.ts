import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID"),
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET"),
});

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
    const { amount, orderId, customerDetails } = await req.json();

    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, orderId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount), // Amount in paise
      currency: "INR",
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        customerEmail: customerDetails?.email || "",
        customerName: customerDetails?.name || "",
      },
    });

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create order",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
