import { supabase } from "./supabaseClient";
import { getOrCreateSessionId } from "./cartApi";

const TOKEN_KEY = "ac_guest_access_token";

export async function ensureSupabaseGuestSession() {
  const existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) {
    await supabase.auth.setSession({
      access_token: existingToken,
      refresh_token: "",
    });
    return;
  }

  const sessionId = getOrCreateSessionId();

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mint-guest-token`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch guest token");
  }

  const { access_token } = await res.json();
  if (!access_token) {
    throw new Error("No access_token in response");
  }

  localStorage.setItem(TOKEN_KEY, access_token);

  await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });
}
