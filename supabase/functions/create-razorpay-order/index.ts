import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  console.log("🔵 === EDGE FUNCTION STARTED ===");
  console.log("Method:", req.method);
  
  // Enable CORS
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("❌ Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log("📖 Reading request body...");
    const body = await req.text();
    console.log("📦 Raw body length:", body.length);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log("✅ JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      return new Response(
        JSON.stringify({ error: "Invalid JSON", details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, orderId, customerDetails } = parsedBody;
    console.log("🔍 Extracted:", { amount, orderId, hasCustDetails: !!customerDetails });

    if (!amount || !orderId) {
      console.error("❌ Missing: amount=" + amount + ", orderId=" + orderId);
      return new Response(
        JSON.stringify({ error: "Missing amount or orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔐 Checking Razorpay secrets...");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    console.log("🔑 Found keys:", { idExists: !!razorpayKeyId, secretExists: !!razorpayKeySecret });

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("❌ Missing Razorpay secrets");
      return new Response(
        JSON.stringify({ error: "Razorpay secrets not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🚀 Creating Razorpay order for amount:", amount);
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: "INR",
        receipt: `order_${orderId}`,
      }),
    });

    console.log("📊 Razorpay response status:", razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error("❌ Razorpay error:", error.substring(0, 200));
      return new Response(
        JSON.stringify({ error: "Razorpay API error", status: razorpayResponse.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log("✅ Order created:", razorpayOrder.id);

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("🔴 ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
