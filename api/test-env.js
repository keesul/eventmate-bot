module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const envCheck = {
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasBotToken: !!process.env.BOT_TOKEN,
    hasWebappUrl: !!process.env.WEBAPP_URL,
    nodeVersion: process.version,
    platform: process.platform
  };

  return res.status(200).json(envCheck);
}
