import React from "react";
import products from "../data/products.json";
import ProductCard from "../components/ProductCard";

function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[#D4AF37]">
          Rituals for intentional glow
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white">
          Browse our edit of everyday essentials crafted to slow you down,
          soften your routine, and let your glow feel intentional.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ShopPage;
