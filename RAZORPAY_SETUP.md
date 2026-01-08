# Razorpay Payment Integration Setup Guide

This guide will help you set up the complete Razorpay payment integration for the Advayacare website.

## Overview

The payment workflow consists of:
1. **Frontend**: React components and payment service for initiating payments
2. **Backend**: Netlify serverless functions for creating and verifying payments
3. **Database**: Supabase tables for storing order and payment information

## Prerequisites

- [Razorpay Account](https://razorpay.com/) (sign up for free)
- [Netlify Account](https://www.netlify.com/) (for hosting the functions)
- [Supabase Account](https://supabase.com/) (already configured)
- Node.js and npm installed

## Step 1: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in to your account
3. Navigate to **Settings > API Keys**
4. You'll see two keys:
   - **Key ID** (public key)
   - **Key Secret** (secret key) - Keep this private!

## Step 2: Update Local Environment Variables

Update `.env.local` in the project root:

```env
VITE_RAZORPAY_KEY_ID=your_actual_razorpay_key_id
```

Replace `your_actual_razorpay_key_id` with your actual Key ID from Razorpay dashboard.

## Step 3: Set Up Netlify Functions Environment Variables

If you're deploying on Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings > Build & Deploy > Environment**
3. Add the following environment variables:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SUPABASE_URL=https://uexezctcwupgaxqhgyeh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to get Supabase Service Role Key:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > API**
4. Copy the **Service Role** key (under "Project API keys")

## Step 4: Set Up Database Tables

You need the following tables in Supabase (these should already exist):

### `orders` table
```sql
- id (uuid, primary key)
- session_id (uuid)
- total_amount_inr (number)
- status (text: 'pending', 'paid', 'failed', 'cancelled')
- razorpay_order_id (text)
- razorpay_payment_id (text)
- paid_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### `order_items` table
```sql
- id (uuid, primary key)
- order_id (uuid, foreign key → orders.id)
- product_id (uuid)
- quantity (number)
- price_inr (number)
- created_at (timestamp)
```

### `cart_items` table (should already exist)
```sql
- id (uuid, primary key)
- session_id (uuid)
- product_id (uuid)
- quantity (number)
- created_at (timestamp)
```

## Step 5: Verify Netlify Functions

The project includes two Netlify functions:

### `netlify/functions/create-razorpay-order.mjs`
- Creates a payment order in Razorpay
- Called when user initiates checkout
- Returns Razorpay order ID and amount

### `netlify/functions/verify-razorpay-payment.mjs`
- Verifies payment signature from Razorpay
- Updates order status in database
- Ensures payment authenticity

## Step 6: Test the Payment Flow

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the Cart page**:
   - Add products to cart
   - Fill in customer details (name, email, phone)
   - Click "Proceed to Checkout"

3. **Complete Payment**:
   - A payment modal will appear
   - Click "Pay Now" to open Razorpay checkout
   - Use Razorpay test credentials:
     - **Card Number**: 4111 1111 1111 1111
     - **Expiry**: Any future date (e.g., 12/25)
     - **CVV**: Any 3 digits (e.g., 123)

4. **Verify Success**:
   - After payment, you should see a success message
   - Check your Supabase dashboard - order status should be "paid"
   - Check Razorpay dashboard - payment should appear in transactions

## Step 7: Deploy to Production

### When deploying on Netlify:

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Razorpay payment integration"
   git push
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Build settings should auto-detect (Vite)
   - Deploy

3. **Add Production Environment Variables**:
   - In Netlify dashboard, go to Site Settings
   - Add all environment variables (same as Step 3)
   - Redeploy the site

4. **Update Razorpay Settings** (if needed):
   - Go to Razorpay Dashboard > Settings > Webhooks
   - Add your production URL for webhook notifications (optional)

## Troubleshooting

### "Razorpay Key ID is missing"
- Check `.env.local` file has `VITE_RAZORPAY_KEY_ID`
- Reload the development server after updating `.env.local`

### "Failed to create Razorpay order"
- Verify Netlify functions are deployed
- Check environment variables on Netlify
- Review browser console and Netlify function logs

### "Payment verification failed"
- Ensure Razorpay Key Secret is correct on Netlify
- Check database connection and order creation
- Verify order status in Supabase dashboard

### Payment shows in Razorpay but not in database
- Check Netlify function logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure order exists in database before payment verification

## File Structure

```
src/
├── lib/
│   └── razorpayApi.js          # Payment initialization service
├── components/
│   └── RazorpayCheckout.jsx    # Payment modal component
└── pages/
    └── CartPage.jsx             # Updated with payment flow

netlify/
└── functions/
    ├── create-razorpay-order.mjs      # Create payment orders
    └── verify-razorpay-payment.mjs    # Verify payments
```

## Features Implemented

✅ **Order Management**
- Create orders with cart items
- Store order details in Supabase

✅ **Payment Processing**
- Razorpay checkout integration
- Secure payment handling
- Payment verification with cryptographic signatures

✅ **Customer Information**
- Capture customer name, email, and phone
- Pass details to payment provider

✅ **Error Handling**
- Graceful error messages for payment failures
- Retry capability

✅ **Order Tracking**
- Update order status from 'pending' to 'paid'
- Store Razorpay payment details
- Record payment timestamp

## Next Steps (Optional)

1. **Order Notifications**:
   - Send confirmation email to customer
   - Send order notification to admin

2. **Order Management Dashboard**:
   - View all orders and their payment status
   - Track shipment status

3. **Refund Processing**:
   - Handle refunds through Razorpay API
   - Update order status in database

4. **Webhook Notifications**:
   - Set up Razorpay webhooks for real-time updates
   - Sync payment status automatically

## Support

For issues with:
- **Razorpay**: Visit [Razorpay Support](https://razorpay.com/support)
- **Netlify**: Visit [Netlify Docs](https://docs.netlify.com)
- **Supabase**: Visit [Supabase Docs](https://supabase.com/docs)
