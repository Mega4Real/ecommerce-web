const { Resend } = require('resend');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const sendReceiptEmail = async (order) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL SERVICE] RESEND_API_KEY not found. Skipping email.');
    return;
  }

  const {
    customer_name,
    customer_email,
    order_number,
    items,
    total,
    shipping_address,
    shipping_city,
    shipping_region,
    discount_amount,
    created_at
  } = order;

  // items might be a string (JSONB) or an array depending on how it's passed
  const orderItems = typeof items === 'string' ? JSON.parse(items) : items;

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <div style="font-weight: 600; color: #333333;">${item.name}</div>
        <div style="font-size: 13px; color: #666666;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; vertical-align: top; font-weight: 600; color: #333333;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: #000000; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .order-info { margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; }
        .totals { margin-top: 20px; padding-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .grand-total { font-size: 20px; font-weight: 700; color: #000000; border-top: 2px solid #000000; padding-top: 15px; margin-top: 15px; }
        .footer { background: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 16px; background: #e6fcf5; color: #0ca678; font-size: 12px; font-weight: 600; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">LUXE ATTIRE</h1>
          <div class="badge">Payment Confirmed</div>
        </div>
        <div class="content">
          <p>Hi ${customer_name},</p>
          <p>Thank you for your purchase! We've received your payment for order <strong>#${order_number}</strong> and we're getting it ready for shipment.</p>
          
          <div class="order-info">
            <div style="font-size: 14px; color: #666;">Order Date: ${new Date(created_at).toLocaleDateString()}</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="text-align: left; font-size: 13px; color: #999; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;">Item</th>
                <th style="text-align: right; font-size: 13px; color: #999; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            ${
              discount_amount > 0
                ? `
            <div class="total-row">
              <span style="color: #666;">Discount</span>
              <span style="font-weight: 600; color: #0ca678;">-${formatCurrency(discount_amount)}</span>
            </div>
            `
                : ''
            }
            <div class="total-row grand-total">
              <span>Total Paid</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          <div style="margin-top: 40px; border-left: 3px solid #000; padding-left: 15px;">
            <div style="font-weight: 700; margin-bottom: 5px; text-transform: uppercase; font-size: 13px;">Shipping Address</div>
            <div style="font-size: 14px; color: #555;">
              ${shipping_address}<br>
              ${shipping_city}, ${shipping_region}
            </div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Luxe Attire. All rights reserved.<br>
          If you have any questions, contact us at luxuryattire01@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Luxe Attire <onboarding@resend.dev>', // Should use verified domain in production
      to: customer_email,
      subject: `Payment Confirmation - Order #${order_number}`,
      html: html,
    });

    console.log('[EMAIL SERVICE] Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send email:', error);
    throw error;
  }
};

module.exports = {
  sendReceiptEmail,
};
