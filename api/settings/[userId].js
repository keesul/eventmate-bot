const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Enable CORS
  const allowedOrigin = process.env.WEBAPP_URL || 'https://eventmate-bot.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/settings/:userId - Get user settings
    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const { data, error } = await supabase
        .from('users')
        .select('language, theme, timezone')
        .eq('telegram_id', userId)
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        settings: {
          language: data?.language || 'uk',
          theme: data?.theme || 'light',
          timezone: data?.timezone || 'UTC'
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Settings error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
