#!/bin/bash

# 🚀 OMR Web Scanner - Foolproof Vercel Deployment Script
echo "🚀 Starting foolproof Vercel deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the web_frontend_nextjs directory."
    exit 1
fi

print_status "✅ Found package.json in correct directory"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "✅ npm is available"

# Clean previous builds
print_status "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
print_success "✅ Cleaned previous builds"

# Install dependencies
print_status "📦 Installing dependencies..."
npm install --force
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "✅ Dependencies installed"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing globally..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
    print_success "✅ Vercel CLI installed"
else
    print_success "✅ Vercel CLI is available"
fi

# Build the project (this should work now with our config)
print_status "🏗️ Building project..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed. Check the errors above."
    exit 1
fi
print_success "✅ Build completed successfully!"

# Deploy to Vercel
print_status "🚀 Deploying to Vercel..."
vercel --prod --yes
if [ $? -ne 0 ]; then
    print_error "Deployment failed. Check the errors above."
    exit 1
fi

print_success "🎉 Deployment completed successfully!"
print_status "Your OMR Web Scanner is now live on Vercel!"
print_status "📱 Features available:"
print_status "  ✅ Mobile-responsive design"
print_status "  ✅ Camera capture with template overlay"
print_status "  ✅ OMR sheet processing"
print_status "  ✅ Results display and export"
print_status "  ✅ Works on all devices"
