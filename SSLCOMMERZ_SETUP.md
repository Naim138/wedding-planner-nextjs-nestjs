# SSLCommerz Payment Gateway Integration Setup

This document explains how to configure SSLCommerz payment gateway for vendor registration and subscription payments.

## Overview

The integration supports:
- **Vendor Registration Fee**: ৳500 (one-time payment)
- **Monthly Subscription**: ৳1000 (recurring payment)
- **Payment Methods**: bKash, Nagad, Rocket (selected on SSLCommerz gateway)

## Backend Configuration

### 1. Environment Variables

Add the following variables to your `backend/.env` file:

```env
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=abcgc6a3f0cdcd7398
SSLCOMMERZ_STORE_PASSWORD=abcgc6a3f0cdcd7398@ssl
SSLCOMMERZ_IS_SANDBOX=true
SSLCOMMERZ_SESSION_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSLCOMMERZ_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php

# Callback URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 2. Getting SSLCommerz Credentials

1. **Register for SSLCommerz Sandbox**:
   - Visit: https://sandbox.sslcommerz.com/
   - Create a merchant account
   - Obtain Store ID and Store Password

2. **For Production**:
   - Contact SSLCommerz for live credentials
   - Update `SSLCOMMERZ_IS_SANDBOX=false`
   - Use production API URLs

### 3. Payment Flow

#### Registration Payment (৳500)
1. User registers as vendor
2. Redirected to `/payment` page
3. Clicks "Pay with SSLCommerz"
4. Redirected to SSLCommerz payment page
5. Selects payment method (bKash/Nagad/Rocket) on SSLCommerz
6. After payment, redirected to `/payment/success`
7. IPN webhook updates user status to active

#### Subscription Payment (৳1000)
1. Vendor pays monthly subscription
2. Same flow as registration
3. Subscription expires after 30 days
4. Vendor must renew to maintain access

## Frontend Configuration

### Payment Pages Created

- `/payment` - Main payment page (SSLCommerz handles method selection)
- `/payment/success` - Success page after payment
- `/payment/cancel` - Cancel page if payment is cancelled

### Payment Status Display

Vendor dashboard shows:
- Registration fee status (Paid/Pending)
- Subscription status (Active/Expired/Inactive)
- Subscription expiry date
- Quick links to complete/renew payments

## API Endpoints

### Backend Endpoints

- `POST /api/v1/payment/vendor-registration` - Create registration payment
- `POST /api/v1/payment/vendor-subscription` - Create subscription payment
- `GET /api/v1/payment/my-payments` - Get user's payment history
- `POST /api/v1/payment/sslcommerz/ipn` - IPN webhook for payment validation
- `POST /api/v1/payment/sslcommerz/callback` - Callback for payment status updates

### Security Features

- All payment endpoints require authentication
- Vendor guard enforces payment status for vendor routes
- IPN validates payment before activating vendor

## Testing

### 1. Test Registration Flow
```bash
# Register as vendor
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","email":"vendor@test.com","password":"password123","role":"vendor"}'
```

### 2. Test Payment Creation
```bash
# Create registration payment
curl -X POST http://localhost:5000/api/v1/payment/vendor-registration \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Test IPN Webhook
```bash
# Simulate successful IPN callback
curl -X POST http://localhost:5000/api/v1/payment/sslcommerz/ipn \
  -H "Content-Type: application/json" \
  -d '{"val_id":"VAL_ID","status":"VALID"}'
```

## Important Notes

1. **Vendor Guard Enforcement**: All vendor routes require active payment status
2. **Subscription Expiry**: Vendors must renew subscription before expiry
3. **Payment Methods**: SSLCommerz gateway supports bKash, Nagad, Rocket
4. **Currency**: All payments are in BDT (Bangladeshi Taka)
5. **Sandbox Mode**: Currently configured for sandbox testing

## Troubleshooting

### Payment URL not generated
- Check SSLCommerz credentials in `.env`
- Verify Store ID and Password are correct
- Check backend logs for API errors
- Ensure callback URLs are accessible

### Vendor status not updated after payment
- Verify IPN URL is reachable from SSLCommerz server
- Check IPN payload matches expected format
- Review payment callback logs
- Test IPN validation manually

### Vendor guard blocking access
- Check user's `vendorPaymentStatus` is "active"
- Verify `vendorSubscriptionStatus` is "active"
- Ensure subscription hasn't expired (`vendorSubscriptionExpiresAt`)

### SSLCommerz session creation failed
- Verify Store ID and Password are correct
- Check if sandbox mode is properly configured
- Ensure registered URL matches your domain
- Review SSLCommerz merchant panel for errors

## Support

- SSLCommerz Documentation: https://developer.sslcommerz.com/
- SSLCommerz GitHub: https://github.com/sslcommerz
- SSLCommerz Support: support@sslcommerz.com
- Merchant Panel: https://sandbox.sslcommerz.com/manage/
