#!/bin/bash

# OMR Web Scanner Next.js Setup Script

echo "🚀 Setting up OMR Web Scanner Next.js Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
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

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "✅ Environment file created!"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your Python backend is running on port 5000"
echo "2. Start the Next.js development server:"
echo "   npm run dev"
echo ""
echo "3. Open your browser and go to: http://localhost:3000"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev    - Start development server"
echo "   npm run build  - Build for production"
echo "   npm run start  - Start production server"
echo "   npm run lint   - Run ESLint"
echo ""
