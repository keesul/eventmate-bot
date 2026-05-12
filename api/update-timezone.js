const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, timezone } = req.body;

    if (!userId || !timezone) {
      return res.status(400).json({ error: 'Missing userId or timezone' });
    }

    // Update user timezone
    const { error } = await supabase
      .from('users')
      .update({ timezone })
      .eq('telegram_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update timezone error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
