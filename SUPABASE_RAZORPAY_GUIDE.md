# Supabase + Razorpay Payment Integration Guide

## Architecture Overview

This payment integration uses:
- **GitHub**: Code repository and CI/CD
- **Supabase**: Backend database and Edge Functions
- **Razorpay**: Payment processing

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (React/Vite on GitHub)                │
│  CartPage.jsx → RazorpayCheckout.jsx → razorpayApi.js      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ↓
┌──────────────────────────────────────────────────────────────┐
│         Supabase Edge Functions (TypeScript/Deno)           │
│                                                               │
│  create-razorpay-order/                                     │
│  └─ Creates payment order in Razorpay                       │
│                                                               │
│  verify-razorpay-payment/                                   │
│  └─ Verifies payment & updates database                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Direct API
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Supabase Database (PostgreSQL)                  │
│                                                               │
│  ├─ orders table                                            │
│  ├─ order_items table                                       │
│  └─ cart_items table                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  Razorpay (Payment Gateway)                  │
│  Handles payment processing, stores transaction data         │
└──────────────────────────────────────────────────────────────┘
```

## Setup Steps

### Step 1: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign in or create account
3. Navigate to **Settings > API Keys**
4. Copy:
   - **Key ID** (for frontend)
   - **Key Secret** (for backend)

### Step 2: Update Frontend Configuration

Update `.env.local` with your Razorpay Key ID:

```env
VITE_RAZORPAY_KEY_ID=your_actual_key_id
```

### Step 3: Add Razorpay Secrets to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > Secrets**
4. Add these secrets:

```
RAZORPAY_KEY_ID = your_razorpay_key_id
RAZORPAY_KEY_SECRET = your_razorpay_key_secret
```

**Important**: These are automatically available to Edge Functions.

### Step 4: Deploy Supabase Edge Functions

The Edge Functions are already created in:
- `supabase/functions/create-razorpay-order/index.ts`
- `supabase/functions/verify-razorpay-payment/index.ts`

To deploy:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

Or use Supabase dashboard:
1. Go to **Edge Functions**
2. Create new function or deploy existing
3. Copy code from `supabase/functions/*/index.ts`

### Step 5: Set Up Database (if not already done)

Ensure these tables exist in Supabase:

```sql
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  total_amount_inr NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price_inr NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Cart Items table (should already exist)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Step 6: Publish to GitHub and Deploy

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add Supabase Edge Functions for Razorpay payment"
   git push origin main
   ```

2. **GitHub Pages deployment** (if using):
   - Build: `npm run build`
   - Deploy: `npm run deploy`

3. **Supabase Edge Functions** are automatically deployed

## Payment Flow

### 1. User Initiates Checkout
```
User fills cart with products
→ Enters delivery details (name, email, phone)
→ Clicks "Proceed to Checkout"
```

### 2. Order Creation
```
Frontend: CartContext.checkout()
├─ Creates order in Supabase
├─ Creates order_items records
└─ Returns order ID
```

### 3. Payment Modal Opens
```
RazorpayCheckout component shows:
├─ Order details
├─ Customer information
└─ "Pay Now" button
```

### 4. Razorpay Order Creation
```
Click "Pay Now"
→ Calls: supabase/functions/create-razorpay-order
├─ Backend receives: amount, orderId, customerDetails
├─ Creates order in Razorpay API
└─ Returns Razorpay order ID
```

### 5. Customer Pays
```
Razorpay checkout modal opens
→ User enters card details
→ Payment gateway processes payment
→ Returns: payment_id, order_id, signature
```

### 6. Payment Verification
```
Calls: supabase/functions/verify-razorpay-payment
├─ Verifies payment signature (HMAC-SHA256)
├─ Fetches payment from Razorpay
├─ Updates order status to "paid"
└─ Returns success
```

### 7. Success & Redirect
```
Frontend shows success message
→ Cart cleared
→ Redirects to home page
```

## Testing

### Test with Razorpay Test Credentials

Use these test card details (only in test mode):

| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry Month | Any month (e.g., 12) |
| Expiry Year | Any future year (e.g., 25) |
| CVV | Any 3 digits (e.g., 123) |
| OTP | 123456 |

### Local Testing

1. Start development server:
   ```bash
   npm run dev
   ```

2. Add products to cart

3. Go to checkout and enter customer details

4. Click "Proceed to Checkout"

5. Use test card details above

6. Verify in Supabase:
   - Check `orders` table
   - Status should be "paid"
   - `razorpay_payment_id` should be set

## Monitoring & Debugging

### Check Supabase Edge Function Logs

1. Go to Supabase dashboard
2. Edge Functions > Select function
3. Click "Logs" tab
4. View real-time function execution logs

### Check Payment Status in Supabase

```sql
SELECT id, status, razorpay_payment_id, paid_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

### Verify in Razorpay Dashboard

1. Go to https://dashboard.razorpay.com
2. Payments section
3. Find your payment
4. Check status and details

## Troubleshooting

### Issue: Edge Function Not Found (404)

**Solution**:
1. Ensure functions are deployed: `supabase functions list`
2. Check function names match in code
3. Verify Supabase URL is correct in `.env.local`

### Issue: "Invalid payment signature"

**Solution**:
1. Verify RAZORPAY_KEY_SECRET is correct in Supabase secrets
2. Check Razorpay payment status in dashboard
3. Review Edge Function logs for errors

### Issue: Order Not Updated After Payment

**Solution**:
1. Check Supabase database connectivity
2. Verify SUPABASE_SERVICE_ROLE_KEY in Edge Function environment
3. Check order ID is passed correctly
4. Review database logs

### Issue: Payment Modal Doesn't Appear

**Solution**:
1. Check browser console for errors
2. Verify Razorpay script loads from checkout.razorpay.com
3. Verify VITE_RAZORPAY_KEY_ID is set and correct
4. Try clearing browser cache

## File Structure

```
advayacarewebsite/
├── src/
│   ├── components/
│   │   └── RazorpayCheckout.jsx
│   ├── lib/
│   │   ├── razorpayApi.js          [Uses Supabase Edge Functions]
│   │   ├── cartApi.js
│   │   ├── supabaseClient.js
│   │   └── authSession.js
│   └── pages/
│       └── CartPage.jsx
│
├── supabase/
│   └── functions/
│       ├── create-razorpay-order/
│       │   └── index.ts           [Supabase Edge Function]
│       ├── verify-razorpay-payment/
│       │   └── index.ts           [Supabase Edge Function]
│       └── mint-guest-token/
│           └── index.ts
│
├── .env.local                      [Frontend config]
├── .env.example                    [Configuration template]
└── README.md                       [Documentation]
```

## Key Advantages of This Architecture

✅ **No External Hosting Required**: Everything runs on Supabase + GitHub
✅ **Secure**: Razorpay secrets never exposed to frontend
✅ **Scalable**: Supabase handles database and Edge Functions
✅ **Type-Safe**: Edge Functions written in TypeScript
✅ **Version Controlled**: All code in GitHub
✅ **Automatic Deployment**: Push to GitHub triggers deployment
✅ **Real-Time Logs**: Monitor Edge Functions in Supabase dashboard

## Next Steps

1. ✅ Code is complete and ready
2. Add Razorpay secrets to Supabase
3. Deploy Edge Functions
4. Test with test card
5. Switch Razorpay to live mode
6. Deploy to production

## Support

- **Razorpay Docs**: https://razorpay.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
