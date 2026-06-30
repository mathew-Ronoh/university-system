// M-Pesa service — integrates with Safaricom Daraja API for mobile money payments
// Handles OAuth authentication, STK Push (lipa na M-Pesa online), and transaction status queries
// Uses sandbox environment by default (MPESA_ENV=sandbox)

const axios = require('axios');
const config = require('../config');

let mpesaAuthToken = null;
let tokenExpiry = null;

// Get OAuth token from Safaricom — caches it until it's about to expire
const getAuthToken = async () => {
  if (mpesaAuthToken && tokenExpiry && Date.now() < tokenExpiry) {
    return mpesaAuthToken;
  }

  const auth = Buffer.from(
    `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
  ).toString('base64');

  const url =
    config.mpesa.env === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const response = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  mpesaAuthToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // Refresh 60s early
  return mpesaAuthToken;
};

// Initiate STK Push — sends a payment request to the customer's phone
// The customer enters their M-Pesa PIN to approve the transaction
const stkPush = async (phone, amount, accountReference, transactionDesc) => {
  const token = await getAuthToken();

  // Generate timestamp in format YYYYMMDDHHmmss
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  // Encrypt shortcode + passkey + timestamp for the password field
  const password = Buffer.from(
    `${config.mpesa.shortCode}${config.mpesa.passkey}${timestamp}`
  ).toString('base64');

  const url =
    config.mpesa.env === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  // Normalize phone: "0712345678" → "254712345678"
  const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;

  const payload = {
    BusinessShortCode: config.mpesa.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,    // Customer's phone
    PartyB: config.mpesa.shortCode,  // Paybill number
    PhoneNumber: formattedPhone,
    CallBackURL: config.mpesa.callbackUrl,  // Where Safaricom sends the result
    AccountReference: accountReference || 'FEES PAYMENT',
    TransactionDesc: transactionDesc || 'University fees payment',
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Query the status of an STK Push transaction (used for reconciliation)
const queryStatus = async (checkoutRequestId) => {
  const token = await getAuthToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${config.mpesa.shortCode}${config.mpesa.passkey}${timestamp}`
  ).toString('base64');

  const url =
    config.mpesa.env === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

  const payload = {
    BusinessShortCode: config.mpesa.shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

module.exports = { stkPush, queryStatus, getAuthToken };
