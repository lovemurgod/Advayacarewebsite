# Payment Integration Quick Reference

## What's Been Implemented

### Frontend Components

#### 1. **RazorpayCheckout Component** (`src/components/RazorpayCheckout.jsx`)
- Modal dialog for payment processing
- Displays order details and customer information
- Handles Razorpay payment modal
- Shows loading and error states

#### 2. **Payment Service** (`src/lib/razorpayApi.js`)
- `loadRazorpayScript()` - Loads Razorpay library dynamically
- `initializeRazorpayPayment()` - Creates payment order on backend
- `handlePaymentSuccess()` - Verifies payment with server
- `getPaymentStatus()` - Checks order payment status

#### 3. **Updated CartPage** (`src/pages/CartPage.jsx`)
- Customer details form (name, email, phone)
- Payment modal integration
- Success/error notifications
- Automatic redirect after successful payment

### Backend Functions

#### 1. **Create Razorpay Order** (`netlify/functions/create-razorpay-order.mjs`)
- Endpoint: `POST /.netlify/functions/create-razorpay-order`
- Creates order in Razorpay
- Returns order ID and amount

#### 2. **Verify Payment** (`netlify/functions/verify-razorpay-payment.mjs`)
- Endpoint: `POST /.netlify/functions/verify-razorpay-payment`
- Verifies payment signature (security)
- Updates order status in database
- Returns transaction details

## Payment Flow

```
User adds products to cart
         ↓
User fills in delivery details
         ↓
User clicks "Proceed to Checkout"
         ↓
Order created in database (status: pending)
         ↓
Payment modal opens
         ↓
User clicks "Pay Now"
         ↓
Razorpay checkout opens
         ↓
User completes payment
         ↓
Payment verified on backend
         ↓
Order status updated to "paid"
         ↓
Success message shown
         ↓
Redirect to home page
```

## Configuration Required

### 1. **Frontend (.env.local)**
```
VITE_RAZORPAY_KEY_ID=your_key_id
```

### 2. **Netlify Environment Variables**
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

### Local Development
1. Start dev server: `npm run dev`
2. Navigate to Cart page
3. Add products
4. Fill customer details
5. Click "Proceed to Checkout"
6. Use Razorpay test card: `4111 1111 1111 1111`

### Test Credentials
- **Card**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **OTP**: 123456

## Database Schema

### Orders Table
```sql
id (uuid)
session_id (uuid)
total_amount_inr (numeric)
status (text) - 'pending', 'paid', 'failed', 'cancelled'
razorpay_order_id (text)
razorpay_payment_id (text)
paid_at (timestamp)
created_at (timestamp)
updated_at (timestamp)
```

### Order Items Table
```sql
id (uuid)
order_id (uuid)
product_id (uuid)
quantity (integer)
price_inr (numeric)
created_at (timestamp)
```

## Key Features

✅ **Secure Payment Processing**
- Signature verification
- Server-side payment validation
- Service role key protection

✅ **Complete Order Management**
- Order creation
- Item tracking
- Payment status updates

✅ **User Experience**
- Clean payment modal
- Loading states
- Error handling
- Success confirmation

✅ **Error Handling**
- Network error recovery
- Invalid payment handling
- Validation feedback

## File Changes Summary

### New Files
- `src/lib/razorpayApi.js` - Payment service
- `src/components/RazorpayCheckout.jsx` - Payment modal
- `netlify/functions/create-razorpay-order.mjs` - Create order function
- `netlify/functions/verify-razorpay-payment.mjs` - Verify payment function
- `.env.example` - Environment variables template
- `RAZORPAY_SETUP.md` - Complete setup guide

### Modified Files
- `src/pages/CartPage.jsx` - Integrated payment flow
- `.env.local` - Added Razorpay key ID
- `package.json` - Added razorpay dependency

## Troubleshooting Checklist

- [ ] Razorpay key ID is set in `.env.local`
- [ ] Netlify environment variables are configured
- [ ] Supabase tables exist and have correct schema
- [ ] Build completes without errors: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Payment modal appears when clicking checkout
- [ ] Test payment creates order in database
- [ ] Test payment updates order status to "paid"

## Next Steps

1. **Get Razorpay API Keys**: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. **Configure Environment Variables**: Update `.env.local` and Netlify
3. **Test Locally**: Use test cards to verify integration
4. **Deploy**: Push to GitHub and deploy on Netlify
5. **Monitor**: Check Razorpay dashboard for payments

## Support Resources

- Razorpay Docs: [https://razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: [https://razorpay.com/support](https://razorpay.com/support)
- Netlify Docs: [https://docs.netlify.com](https://docs.netlify.com)
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
