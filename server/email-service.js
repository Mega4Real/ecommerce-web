const { Resend } = require('resend');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const formatCurrency = (amount) => {
  return `GH₵${Number(amount).toFixed(2)}`;
};

const sendReceiptEmail = async (order) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL SERVICE] RESEND_API_KEY not found. Skipping email.');
    return;
  }

  const {
    customer_name,
    customer_email,
    customer_phone,
    order_number,
    items,
    total,
    shipping_address,
    shipping_city,
    shipping_region,
    discount_amount,
    created_at,
    payment_method
  } = order;

  // items might be a string (JSONB) or an array depending on how it's passed
  const orderItems = typeof items === 'string' ? JSON.parse(items) : items;

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />` : ''}
          <div>
            <div style="font-weight: 600; color: #1a1a1a; font-size: 14px;">${item.name}</div>
            ${item.size ? `<div style="font-size: 12px; color: #666;">Size: ${item.size}</div>` : ''}
            <div style="font-size: 12px; color: #666;">Qty: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: middle; font-weight: 600; color: #1a1a1a;">
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
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: #ffffff; color: #000000; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .brand-name { font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0; color: #000; }
        .brand-tagline { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
        .content { padding: 40px 30px; }
        .thank-you { text-align: center; margin-bottom: 40px; }
        .thank-you h2 { margin: 0 0 10px 0; font-size: 22px; color: #1a1a1a; }
        .thank-you p { margin: 0; color: #666; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; }
        .delivery-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .footer { padding: 40px 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-name">MEGA4REAL</h1>
          <div class="brand-tagline">Your Premium Shopping Destination</div>
        </div>
        <div class="content">
          <div class="thank-you">
            <h2>Thank You for Your Order! 🎉</h2>
            <p>We've received your order and will process it shortly.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <div style="padding: 15px; background: #f9f9f9; border-radius: 8px;">
               <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                 <span style="font-size: 12px; color: #999; font-weight: 700;">ORDER NUMBER</span>
                 <span style="font-size: 12px; color: #1a1a1a; font-weight: 700;">#${order_number}</span>
               </div>
               <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                 <span style="font-size: 12px; color: #999; font-weight: 700;">DATE</span>
                 <span style="font-size: 12px; color: #1a1a1a; font-weight: 700;">${new Date(created_at).toLocaleDateString()}</span>
               </div>
               <div style="display: flex; justify-content: space-between;">
                 <span style="font-size: 12px; color: #999; font-weight: 700;">PAYMENT METHOD</span>
                 <span style="font-size: 12px; color: #1a1a1a; font-weight: 700;">${payment_method || 'Standard'}</span>
               </div>
            </div>
          </div>

          <div class="delivery-info">
             <div style="font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; margin-bottom: 10px;">Delivery Information</div>
             <div style="font-weight: 700; color: #1a1a1a; margin-bottom: 5px;">${customer_name}</div>
             <div style="font-size: 14px; color: #444; margin-bottom: 3px;">📞 ${customer_phone || 'N/A'}</div>
             <div style="font-size: 14px; color: #444;">📍 ${shipping_address}, ${shipping_city}${shipping_region ? `, ${shipping_region}` : ''}</div>
          </div>

          <div class="section-title">Order Items</div>
          <table class="table">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table style="width: 100%; border-top: 2px solid #f0f0f0; margin-top: 30px; padding-top: 20px;">
            <tbody>
              ${
                discount_amount > 0
                  ? `
              <tr>
                <td style="padding: 5px 0; color: #666; font-size: 14px;">Discount</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #d0021b; font-size: 14px;">-${formatCurrency(discount_amount)}</td>
              </tr>
              `
                  : ''
              }
              <tr>
                <td style="padding: 15px 0; font-weight: 700; color: #1a1a1a; border-top: 1px solid #f0f0f0;">Total Amount</td>
                <td style="padding: 15px 0; text-align: right; font-size: 28px; font-weight: 800; color: #000; border-top: 1px solid #f0f0f0;">
                  ${formatCurrency(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p style="margin-bottom: 10px; font-weight: 600; color: #666;">Need Help?</p>
          <p style="margin: 0;">📧 support@mega4real.com | 📱 +233 123 456 789</p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} MEGA4REAL. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </body>
    </html>
  `

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
