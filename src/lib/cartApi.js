import { supabase } from "./supabaseClient";

export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem("ac_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("ac_session_id", sessionId);
  }
  return sessionId;
}

export async function fetchCartItems() {
  const sessionId = getOrCreateSessionId();
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity, products:product_id(name, price_inr)")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    name: row.products?.name ?? "",
    price_inr: row.products?.price_inr ?? 0,
    quantity: row.quantity ?? 1,
  }));
}

export async function addCartItem(productId, quantity = 1) {
  const sessionId = getOrCreateSessionId();
  const { data, error } = await supabase
    .from("cart_items")
    .insert({ product_id: productId, quantity, session_id: sessionId })
    .select("id, product_id, quantity").single();

  if (error) throw error;
  return data;
}

export async function updateCartItem(id, quantity) {
  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", id)
    .select("id, product_id, quantity").single();

  if (error) throw error;
  return data;
}

export async function removeCartItem(id) {
  const { error } = await supabase.from("cart_items").delete().eq("id", id);
  if (error) throw error;
}

export async function clearCartRemote() {
  const sessionId = getOrCreateSessionId();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("session_id", sessionId);
  if (error) throw error;
}

export async function createOrder(totalAmountInr, items) {
  const sessionId = getOrCreateSessionId();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      session_id: sessionId,
      total_amount_inr: totalAmountInr,
      status: "pending",
    })
    .select("id").single();

  if (orderError) throw orderError;

  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price_inr: item.price_inr,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) throw itemsError;

  return order;
}
