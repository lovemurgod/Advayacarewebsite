import React from "react";
import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalBackgroundOrbs from "./components/GlobalBackgroundOrbs";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import GiftCardPage from "./pages/GiftCardPage";

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col text-black relative">
        <GlobalBackgroundOrbs />
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <main id="main" className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/gift-card" element={<GiftCardPage />} />
            </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </CartProvider>
  );
}

export default App;
