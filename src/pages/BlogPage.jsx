import React from "react";

function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-4">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
        Blog
      </h1>
      <p className="text-sm sm:text-base leading-relaxed text-slate-700">
        This is where our autoblog, powered by n8n, will live. Expect
        gentle deep-dives into ingredients, rituals, and routines crafted for
        Indian skin and climate.
      </p>
    </div>
  );
}

export default BlogPage;
