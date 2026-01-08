import { supabase } from "./supabaseClient";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!RAZORPAY_KEY_ID) {
  // eslint-disable-next-line no-console
  console.warn("Razorpay Key ID is missing. Check .env.local");
}

/**
 * Initialize Razorpay payment
 * Calls Supabase Edge Function to create order in Razorpay
 */
export async function initializeRazorpayPayment(amount, orderId, customerDetails = {}) {
  try {
    const functionUrl = `${SUPABASE_URL}/functions/v1/create-razorpay-order`;
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount, // Amount in paise (smallest currency unit)
        orderId, // Your order ID from database
        customerDetails,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create Razorpay order: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // { razorpayOrderId, amount, currency }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error initializing Razorpay payment:", error);
    throw error;
  }
}

/**
 * Handle Razorpay payment success
 * Calls Supabase Edge Function to verify payment and update order
 */
export async function handlePaymentSuccess(paymentData) {
  try {
    const functionUrl = `${SUPABASE_URL}/functions/v1/verify-razorpay-payment`;
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Payment verification failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result; // { success: true, orderId, transactionId }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error verifying payment:", error);
    throw error;
  }
}

/**
 * Get payment status from database
 */
export async function getPaymentStatus(orderId) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, razorpay_payment_id, razorpay_order_id")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching payment status:", error);
    throw error;
  }
}

/**
 * Load Razorpay script
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
