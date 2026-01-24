#!/bin/bash

# HerCare+ Google OAuth Quick Setup Script

echo "🔐 HerCare+ Google OAuth Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Generate NEXTAUTH_SECRET
echo "🔑 Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create .env.local
cat > .env.local << EOF
# HerCare+ Environment Variables (Local Development)

# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Credentials
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
EOF

echo ""
echo "✅ .env.local created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://console.cloud.google.com/apis/credentials"
echo "2. Create OAuth 2.0 Client ID (Web application)"
echo "3. Add this redirect URI:"
echo "   👉 http://localhost:3000/api/auth/callback/google"
echo ""
echo "4. Copy your Client ID and Secret"
echo "5. Update .env.local with your credentials"
echo ""
echo "6. Restart your dev server: npm run dev"
echo ""
echo "📖 Full guide: See GOOGLE_OAUTH_SETUP.md"
echo ""
