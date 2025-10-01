'use client';

import React from 'react';
import { Scan, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface HeaderProps {
  backendStatus: 'checking' | 'online' | 'offline';
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ backendStatus, onReset }) => {
  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Scan className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                OMR Web Scanner
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <p className="text-gray-600 text-sm sm:text-base">
                  Fast & Accurate OMR Processing
                </p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Performance Badge - Mobile Optimized */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-xl border border-blue-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-blue-700">
                <span className="hidden sm:inline">Next.js Powered</span>
                <span className="sm:hidden">Next.js</span>
              </span>
            </div>

            {/* Reset Button - Mobile Optimized */}
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
              title="Reset Application">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
