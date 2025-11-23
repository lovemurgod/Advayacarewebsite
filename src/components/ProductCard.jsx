import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  if (!product) return null;

  const { id, name, price_inr, benefits_brief, one_line_summary, images = [], filterTags = [] } = product;

  const resolveImage = (filename) => {
    if (!filename) return undefined;
    const hasExt = filename.includes(".");
    const finalName = hasExt ? filename : `${filename}.avif`;
    return `${import.meta.env.BASE_URL}images/${finalName}`;
  };

  const imageSrc = images.length ? resolveImage(images[0]) : undefined;
  const formattedPrice = Number(price_inr || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    navigate("/cart");
  };

  return (
    <Link
      to={`/product/${id}`}
      className="group flex flex-col rounded-2xl border border-black bg-[#D4AF37] shadow-sm/40 hover:shadow-md transition-shadow overflow-hidden"
    >
      {imageSrc && (
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-2">
            {name}
          </h3>
          {(one_line_summary || benefits_brief) && (
            <p className="text-sm text-[#333333] line-clamp-2">
              {one_line_summary || benefits_brief}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-sm sm:text-base font-semibold text-slate-900">
            {formattedPrice}
          </span>
        </div>
        {filterTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-900"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-full bg-black px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full rounded-full bg-black px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
