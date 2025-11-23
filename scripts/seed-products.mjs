import { createClient } from '@supabase/supabase-js';
import products from '../src/data/products.json' assert { type: 'json' };

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars (VITE_SUPABASE_URL and key).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    const rows = products.map((p) => ({
      id: p.id,
      name: p.name,
      price_inr: p.price_inr,
      filter_tags: p.filterTags,
      images: p.images,
      one_line_summary: p.one_line_summary,
      ingredients: p.ingredients,
      benefits_brief: p.benefits_brief,
      benefits_detail: p.benefits_detail,
      use_cases: p.use_cases,
    }));

    const { error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding products:', error);
      process.exit(1);
    }

    console.log(`Seeded ${rows.length} products successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error while seeding products:', err);
    process.exit(1);
  }
}

seed();
