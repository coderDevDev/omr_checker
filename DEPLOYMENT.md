# OMR Web Scanner - Deployment Guide

## 🚀 Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd web_frontend_nextjs
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

### 2. Netlify

```bash
# Build the project
npm run build

# Deploy the 'out' directory to Netlify
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=out
```

### 3. AWS Amplify

```bash
# Connect your GitHub repository to AWS Amplify
# Build settings:
# - Build command: npm run build
# - Base directory: web_frontend_nextjs
# - Output directory: out
```

## 🔧 Pre-Deployment Setup

### 1. Environment Variables

Create `.env.production` file:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_APP_NAME=OMR Scanner
```

### 2. Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

### 3. Backend Configuration

Make sure your Flask backend is deployed and accessible:

- Update API URLs in `services/api.ts`
- Ensure CORS is configured for your frontend domain
- Test API endpoints are working

## 📱 Mobile Deployment Considerations

### PWA Configuration (Optional)

Add to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
```

### HTTPS Requirements

- Camera access requires HTTPS in production
- Ensure your deployment platform provides SSL certificates
- Update API URLs to use HTTPS

## 🎯 Deployment Checklist

- [ ] `.gitignore` file created ✅
- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] HTTPS enabled for camera access
- [ ] Build tested locally
- [ ] Domain configured
- [ ] SSL certificate active

## 🔗 Important URLs

After deployment, update these in your code:

- API Base URL: `https://your-api-domain.com`
- Frontend URL: `https://your-frontend-domain.com`

## 🐛 Troubleshooting

### Camera Not Working

- Ensure HTTPS is enabled
- Check browser permissions
- Test on actual mobile device

### API Connection Issues

- Verify CORS settings
- Check API endpoint URLs
- Ensure backend is running

### Build Errors

- Check Node.js version (18+ recommended)
- Clear `.next` folder and rebuild
- Verify all dependencies are installed
