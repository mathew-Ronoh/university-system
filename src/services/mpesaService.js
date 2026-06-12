const axios = require('axios');
const config = require('../config');

let mpesaAuthToken = null;
let tokenExpiry = null;

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
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return mpesaAuthToken;
};

const stkPush = async (phone, amount, accountReference, transactionDesc) => {
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
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;

  const payload = {
    BusinessShortCode: config.mpesa.shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: config.mpesa.shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: config.mpesa.callbackUrl,
    AccountReference: accountReference || 'FEES PAYMENT',
    TransactionDesc: transactionDesc || 'University fees payment',
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

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
