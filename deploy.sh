#!/bin/bash

# OMR Web Scanner - Deployment Script
echo "🚀 Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run linting
echo "🔍 Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found, but continuing..."
fi

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy the 'out' directory to your hosting platform"
echo "2. Ensure your backend API is accessible"
echo "3. Update API URLs in production"
echo "4. Test camera functionality on HTTPS"
echo ""
echo "📱 Deployment platforms:"
echo "- Vercel: vercel --prod"
echo "- Netlify: Deploy 'out' directory"
echo "- AWS Amplify: Connect GitHub repo"
echo ""
echo "🔧 Don't forget to:"
echo "- Set up HTTPS for camera access"
echo "- Configure environment variables"
echo "- Update API endpoints"
echo "- Test on mobile devices"
