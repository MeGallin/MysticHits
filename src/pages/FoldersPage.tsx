import React from 'react';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/state/authAtoms';
import FolderList from '@/components/folders/FolderList';
import { Navigate } from 'react-router-dom';

const FoldersPage: React.FC = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>

      {/* Animated background elements - keeping the same style as the main app */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="flex-grow flex flex-col z-10 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Members Area</h1>
            <p className="text-gray-400">
              Create, manage, and play your music folders. Add local folders or
              remote URLs to organize your music collection.
            </p>
          </div>

          <FolderList />
        </div>
      </div>
    </div>
  );
};

export default FoldersPage;
