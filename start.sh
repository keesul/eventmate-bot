#!/bin/bash

# Create .env file from Railway environment variables
cat > .env << EOF
BOT_TOKEN=${BOT_TOKEN}
WEBAPP_URL=${WEBAPP_URL}
PORT=${PORT}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF

# Start the bot
node src/bot.js
