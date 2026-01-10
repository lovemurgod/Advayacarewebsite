const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    console.log("📦 Raw body received:", body.substring(0, 100));
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log("✅ JSON parsed successfully");
      console.log("📊 Parsed body:", JSON.stringify(parsedBody).substring(0, 200));
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, orderId, customerDetails } = parsedBody;
    console.log("🔍 Extracted fields:", { amount, orderId, hasCustomerDetails: !!customerDetails });

    if (!amount || !orderId) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, orderId", received: { amount, orderId } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔐 Checking Razorpay credentials...");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    console.log("🔑 Credentials status:", {
      keyIdExists: !!razorpayKeyId,
      keySecretExists: !!razorpayKeySecret,
      keyIdPreview: razorpayKeyId ? razorpayKeyId.substring(0, 10) : "null",
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("❌ Razorpay credentials missing");
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🚀 Creating Razorpay order...");
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    console.log("📡 Calling Razorpay API...");
    
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
        notes: {
          orderId: orderId.toString(),
          customerEmail: customerDetails?.email || "",
          customerName: customerDetails?.name || "",
        },
      }),
    });

    console.log("📊 Razorpay API response status:", razorpayResponse.status);
    const razorpayData = await razorpayResponse.text();
    console.log("📦 Razorpay response body:", razorpayData.substring(0, 200));

    if (!razorpayResponse.ok) {
      const error = JSON.parse(razorpayData);
      console.error("❌ Razorpay API error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create Razorpay order",
          razorpayError: error,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayOrder = JSON.parse(razorpayData);
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    const responseData = {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
    console.log("📤 Returning success response");

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("🔴 === CAUGHT ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
