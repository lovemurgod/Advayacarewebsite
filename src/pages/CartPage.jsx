import React, { useState } from "react";
import { useCart } from "../context/CartContext";

function CartPage() {
  const {
    items,
    subtotal,
    discountedTotal,
    discount,
    couponCode,
    giftCardCode,
    setCouponCode,
    setGiftCardCode,
    clearCouponCode,
    clearGiftCardCode,
    updateQuantity,
    removeFromCart,
    checkout,
  } = useCart();

  const [localCoupon, setLocalCoupon] = useState(couponCode || "");
  const [localGiftCard, setLocalGiftCard] = useState(giftCardCode || "");

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  const formattedSubtotal = subtotal.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const formattedDiscountedTotal = discountedTotal.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const formattedDiscount = discount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckoutError("");
    setCheckoutSuccess("");
    setIsCheckingOut(true);
    try {
      const order = await checkout();
      if (order) {
        setCheckoutSuccess("Order created successfully. Complete payment with Razorpay.");
      }
    } catch (err) {
      setCheckoutError("Failed to start checkout. Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 text-[#FFD700]">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <p className="text-sm text-slate-600">Your cart is currently empty.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#FFD700] px-4 py-3 shadow-sm"
              >
                <div className="flex-1">
                  <h2 className="text-sm sm:text-base font-medium text-slate-900">
                    {item.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {Number(item.price_inr || 0).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 rounded-full border border-slate-200 bg-white px-2 py-1 text-center text-sm text-slate-900 focus:border-[#b58b2f] focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs rounded-full bg-black text-white px-3 py-1 hover:bg-slate-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-5 rounded-2xl border border-slate-100 bg-[#FFD700] p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formattedSubtotal}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Discounts (coupon &amp; gift card)</span>
                <span>-{formattedDiscount}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>{formattedDiscountedTotal}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-sm">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localCoupon}
                    onChange={(e) => setLocalCoupon(e.target.value)}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#b58b2f] focus:outline-none focus:ring-0"
                    placeholder="Enter coupon (e.g. GLOW10)"
                  />
                  <button
                    type="button"
                    onClick={() => setCouponCode(localCoupon)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:border-[#b58b2f] hover:text-[#b58b2f] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Gift Card Code
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={localGiftCard}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLocalGiftCard(v);
                      if (v === "") {
                        clearGiftCardCode();
                      }
                    }}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#b58b2f] focus:outline-none focus:ring-0"
                    placeholder="Enter gift card code"
                  />
                  {giftCardCode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setGiftCardCode(localGiftCard);
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:border-[#b58b2f] hover:text-[#b58b2f] transition-colors"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearGiftCardCode();
                          setLocalGiftCard("");
                        }}
                        className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGiftCardCode(localGiftCard)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:border-[#b58b2f] hover:text-[#b58b2f] transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {giftCardCode && (
                  <p className="text-[11px] text-slate-700 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                      Applied: {giftCardCode.toUpperCase()}
                    </span>
                    <span className="text-slate-600">(removing resets discount)</span>
                  </p>
                )}
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Discount calculations are for demonstration only. Final payment and
                Razorpay integration will be completed during payment step.
              </p>
            </div>
            {checkoutError && (
              <p className="text-xs text-red-600 pt-1">{checkoutError}</p>
            )}
            {checkoutSuccess && (
              <p className="text-xs text-emerald-700 pt-1">{checkoutSuccess}</p>
            )}

            <button
              className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              disabled={isCheckingOut || !items.length}
              onClick={handleCheckout}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
