// Netlify Function: sends a Telegram message to the site owner when a
// promotion payment is verified on the promote page.
// Required Netlify env vars (Site settings -> Environment variables):
//   TELEGRAM_BOT_TOKEN - token from @BotFather
//   TELEGRAM_CHAT_ID   - owner's Telegram user/chat id (from @userinfobot)
// If the vars are not set, this returns 501 and the page still shows success.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 501, body: JSON.stringify({ ok: false, error: 'telegram not configured' }) };
  }
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'bad json' };
  }
  const text =
    '🚀 New promotion request\n' +
    'Order: ' + (data.orderId || '-') + '\n' +
    'Title: ' + (data.title || '-') + '\n' +
    'Link: ' + (data.link || '-') + '\n' +
    'Viewers: ' + (data.viewers || '-') + '\n' +
    'Paid: ' + (data.grams || '-') + ' GRAM (~$' + (data.usd || '-') + ')\n' +
    'Tx: ' + (data.txHash || '-');
  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
    const j = await res.json();
    return { statusCode: res.ok ? 200 : 502, body: JSON.stringify({ ok: res.ok, result: j }) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ ok: false, error: String(e) }) };
  }
};
