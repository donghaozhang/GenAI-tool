# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for your AI marketplace application.

## 🚀 Quick Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a new account or sign in
3. Complete account verification

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Update Environment Variables
Add your Stripe keys to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
VITE_STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### 4. Set Up Supabase Environment Variables
In your Supabase project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 5. Deploy Edge Functions
```bash
# Deploy the payment-related Edge Functions
supabase functions deploy create-payment-intent --no-verify-jwt
supabase functions deploy process-payment-success --no-verify-jwt
supabase functions deploy consume-credits --no-verify-jwt
```

### 6. Run Database Migration
```bash
# Apply the credits system migration
supabase db push
```

## 📋 Features Included

### ✅ Payment Processing
- **Secure Stripe Elements**: Credit card processing with PCI compliance
- **Payment Intents**: One-time payments for credit packages
- **Real-time Validation**: Instant payment verification
- **Error Handling**: Comprehensive error management

### ✅ Credit System
- **User Credits**: Track AI generation credits per user
- **Automatic Consumption**: Credits consumed on each AI generation
- **Batch Processing**: Credit validation for multi-model generations
- **Free Credits**: New users get 10 free credits

### ✅ Pricing Plans
- **Starter Pack**: 100 credits for $9.99
- **Professional**: 500 credits for $39.99
- **Enterprise**: 2000 credits for $149.99

### ✅ User Experience
- **Credits Display**: Real-time credit balance in marketplace
- **Purchase Flow**: Seamless checkout experience
- **Success Confirmation**: Payment success with credit addition
- **Insufficient Credits**: Clear messaging when credits run out

## 🔧 Technical Architecture

### Frontend Components
```
src/
├── services/stripe.ts              # Stripe service layer
├── components/marketplace/
│   ├── PricingPlans.tsx           # Credit packages display
│   ├── PaymentForm.tsx            # Stripe Elements form
│   └── CreditsDisplay.tsx         # User credit balance
└── pages/
    ├── Payment.tsx                # Payment checkout page
    └── PaymentSuccess.tsx         # Success confirmation
```

### Backend Functions
```
supabase/functions/
├── create-payment-intent/         # Create Stripe payment intent
├── process-payment-success/       # Verify payment & add credits
└── consume-credits/               # Consume credits for AI generation
```

### Database Schema
```sql
-- User credits table
user_credits (
  id, user_id, credits, created_at, updated_at
)

-- Transaction history
transactions (
  id, user_id, payment_intent_id, amount, currency, 
  credits_purchased, status, created_at, updated_at
)
```

## 🛠️ Configuration

### Stripe Webhook (Optional)
For production, set up webhooks to handle payment events:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Price IDs (Production)
Update `PRICING_PLANS` in `src/services/stripe.ts` with actual Stripe Price IDs:

```typescript
export const PRICING_PLANS = {
  starter: {
    // ... other fields
    priceId: 'price_1234567890abcdef', // Replace with actual Price ID
  },
  // ... other plans
};
```

## 🧪 Testing

### Test Cards
Use Stripe's test cards for development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

### Test Flow
1. Visit `/pricing` to see credit packages
2. Click "Purchase" on any plan
3. Fill payment form with test card
4. Verify credits are added to account
5. Test AI generation with credit consumption

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file to git
- ✅ Use different keys for test/production
- ✅ Rotate keys if accidentally exposed
- ✅ Use Supabase environment variables for Edge Functions

### Payment Security
- ✅ Stripe Elements handles PCI compliance
- ✅ Payment processing happens server-side
- ✅ Webhook verification for production
- ✅ User authentication required for purchases

## 🚨 Troubleshooting

### Common Issues

#### "Stripe not initialized"
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Verify key starts with `pk_test_` or `pk_live_`

#### "Payment intent creation failed"
- Verify `STRIPE_SECRET_KEY` in Supabase environment variables
- Check Edge Function deployment status

#### "Insufficient credits" error
- Verify user has credits in `user_credits` table
- Check credit consumption logic in `consume-credits` function

#### Database connection errors
- Ensure migration has been applied: `supabase db push`
- Verify Row Level Security policies are correct

### Debug Commands
```bash
# Check Supabase status
supabase status

# View Edge Function logs
supabase functions logs create-payment-intent

# Test database connection
supabase db ping
```

## 📈 Analytics & Monitoring

### Stripe Dashboard
Monitor payments, customers, and revenue in the Stripe Dashboard:
- **Payments**: Track successful/failed transactions
- **Customers**: View customer payment history
- **Revenue**: Analyze income trends

### Supabase Metrics
Track usage in Supabase Dashboard:
- **Database**: Monitor credit consumption patterns
- **Edge Functions**: Track payment processing performance
- **Auth**: Monitor user registration and retention

## 🔄 Deployment

### Environment Variables Checklist
Before deploying to production:

- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (live key)
- [ ] `STRIPE_SECRET_KEY` in Supabase (live key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in Supabase
- [ ] Database migration applied
- [ ] Edge Functions deployed
- [ ] Webhook endpoints configured (if using)

### Go Live Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoints
- [ ] Test payment flow end-to-end
- [ ] Monitor initial transactions
- [ ] Set up alerts for failed payments

## 💡 Next Steps

### Enhancements
- **Subscription Plans**: Recurring monthly payments
- **Usage Analytics**: Track credit consumption patterns
- **Referral System**: Credit rewards for referrals
- **Bulk Discounts**: Volume pricing for enterprise users
- **Payment Methods**: Add PayPal, Apple Pay, Google Pay

### Integration Ideas
- **Email Notifications**: Payment confirmations via email
- **Discord Bot**: Credit balance notifications
- **Mobile App**: React Native integration
- **Admin Dashboard**: Payment management interface

---

**Need Help?** 
- Check [Stripe Documentation](https://stripe.com/docs)
- Visit [Supabase Docs](https://supabase.com/docs)
- Review Edge Function logs for debugging 