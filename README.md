# OMR Web Scanner - Next.js Version

A high-performance web application for Optical Mark Recognition (OMR) processing, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **⚡ Next.js 14 Performance**: Built with the latest Next.js for optimal speed and SEO
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎯 TypeScript**: Full type safety and better development experience
- **🎨 Modern UI**: Beautiful interface with Tailwind CSS and Lucide icons
- **📊 Real-time Processing**: Live progress tracking and status updates
- **📁 Batch Processing**: Handle multiple OMR sheets simultaneously
- **💾 Export Results**: Download results as CSV files
- **🔧 Backend Integration**: Seamless connection to Python OMR processing backend

## 🏗️ Architecture

```
Frontend (Next.js) ↔ Backend API (Python Flask) ↔ OMR Engine
     ↓                      ↓                    ↓
- Server Components      - REST API            - Core OMR Logic
- Client Components      - File Processing     - Template System
- API Routes            - Image Processing     - Detection Algorithms
- Performance Optimizations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Python backend running (see backend setup)

### Installation

1. **Clone and navigate to the Next.js frontend:**

   ```bash
   cd OMRChecker/web_frontend_nextjs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
web_frontend_nextjs/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx
│   ├── TemplateUpload.tsx
│   ├── ImageUpload.tsx
│   ├── ResultsDisplay.tsx
│   ├── ProcessingStatus.tsx
│   └── LoadingSpinner.tsx
├── services/              # API services
│   └── api.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   └── cn.ts
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🎨 UI Components

### Core Components

- **Header**: Application header with backend status and reset functionality
- **TemplateUpload**: Drag & drop template upload with validation
- **ImageUpload**: Single/batch image processing with mode selection
- **ResultsDisplay**: Comprehensive results table with export functionality
- **ProcessingStatus**: Real-time progress tracking with visual indicators
- **LoadingSpinner**: Reusable loading component with different sizes

### Features

- **Drag & Drop**: Intuitive file upload interface
- **Real-time Status**: Backend connectivity monitoring
- **Progress Tracking**: Visual progress bars and step indicators
- **Error Handling**: User-friendly error messages and validation
- **Export Functionality**: CSV export with formatted results
- **Mobile Responsive**: Optimized for all device sizes

## ⚡ Performance Optimizations

### Next.js Optimizations

- **App Router**: Using Next.js 13+ App Router for better performance
- **Dynamic Imports**: Lazy loading of heavy components
- **Image Optimization**: Built-in Next.js image optimization
- **Code Splitting**: Automatic code splitting for faster loads
- **Static Generation**: Pre-rendered pages for better SEO

### Bundle Optimizations

- **Tree Shaking**: Automatic removal of unused code
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Intelligent caching strategies
- **Bundle Analysis**: Optimized bundle sizes

## 🔧 Configuration

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Development settings
NODE_ENV=development

# Build settings
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Tailwind Configuration

The app uses a custom Tailwind configuration with:

- Extended color palette
- Custom animations
- Responsive breakpoints
- Component utilities

## 📱 Mobile Support

- **Touch-Friendly**: Optimized for touch interactions
- **Responsive Design**: Adapts to all screen sizes
- **Mobile Navigation**: Easy-to-use mobile interface
- **Performance**: Optimized for mobile devices

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Other Platforms

#### Netlify

```bash
npm run build
# Deploy the 'out' directory
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality

- **ESLint**: Code linting with Next.js rules
- **TypeScript**: Full type safety
- **Prettier**: Code formatting (optional)
- **Husky**: Git hooks for quality checks (optional)

## 🧪 Testing

```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📊 Performance Monitoring

The app includes built-in performance monitoring:

- Bundle size analysis
- Core Web Vitals tracking
- API response time monitoring
- User interaction analytics

## 🔒 Security

- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Type and size validation
- **Environment Variables**: Secure configuration management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project follows the same MIT license as the main OMR project.

## 🆚 Next.js vs React Comparison

| Feature         | Next.js Version     | React Version   |
| --------------- | ------------------- | --------------- |
| **Performance** | ⚡ Faster (SSR/SSG) | 🐌 Slower (CSR) |
| **SEO**         | ✅ Excellent        | ❌ Poor         |
| **Bundle Size** | 📦 Optimized        | 📦 Larger       |
| **Development** | 🚀 Hot reload       | 🚀 Hot reload   |
| **Deployment**  | 🎯 Easy (Vercel)    | 🔧 Complex      |
| **TypeScript**  | ✅ Built-in         | ✅ Available    |
| **Mobile**      | 📱 Optimized        | 📱 Good         |

## 🎯 Why Next.js?

1. **Performance**: Server-side rendering and static generation
2. **SEO**: Better search engine optimization
3. **Developer Experience**: Built-in optimizations and tooling
4. **Deployment**: Easy deployment with Vercel
5. **Future-Proof**: Latest React features and best practices
6. **Bundle Optimization**: Automatic code splitting and optimization

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
#   o m r _ c h e c k e r  
 