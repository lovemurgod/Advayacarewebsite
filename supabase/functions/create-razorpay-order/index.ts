const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  console.log("=== Edge Function Started ===");
  console.log("Method:", req.method);
  
  // Enable CORS
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body received:", { amount: body.amount, orderId: body.orderId });

    const { amount, orderId, customerDetails } = body;

    if (!amount || !orderId) {
      console.error("Missing fields:", { amount, orderId });
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking Razorpay credentials...");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    console.log("Credentials check:", {
      keyIdSet: !!razorpayKeyId,
      keySecretSet: !!razorpayKeySecret,
      keyIdLength: razorpayKeyId?.length || 0,
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Missing Razorpay credentials in Supabase secrets");
      return new Response(
        JSON.stringify({
          error: "Razorpay credentials not configured in Supabase",
          debug: {
            keyIdSet: !!razorpayKeyId,
            keySecretSet: !!razorpayKeySecret,
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating Razorpay order...");
    // Create Razorpay order using REST API
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    console.log("Auth header created, calling Razorpay API...");
    
    const response = await fetch("https://api.razorpay.com/v1/orders", {
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

    console.log("Razorpay API response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("Razorpay API error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create Razorpay order",
          details: error.error?.description || error.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayOrder = await response.json();
    console.log("Razorpay order created successfully:", razorpayOrder.id);

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("=== ERROR ===", error.message);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to create order",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
