import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
  BarChart,
  FolderIcon,
  Home,
  Info,
  MessageSquare,
} from 'lucide-react';
import { logoutUser } from '@services/fetchServices';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, isAdminAtom, logout } from '../state/authAtoms';
import { AUTH_EVENTS } from '../utils/authUtils';

/**
 * Navigation component that displays the site navigation bar
 * Responsive design with mobile menu and auth dropdown
 */
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const navigate = useNavigate();
  const location = useLocation();

  // Force re-render when location changes
  useEffect(() => {
    // This effect runs when route changes, helping ensure nav reflects current auth state
    console.log('Navigation updated on route change');
  }, [location.pathname]);

  // Function to close dropdown menu
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      logout(); // Call our Jotai logout function
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Listen for auth events to ensure UI updates
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth event detected in Navigation');
      // Force re-render
      setIsDropdownOpen(false);
    };

    // Add event listeners for login and logout events
    window.addEventListener(AUTH_EVENTS.LOGIN, handleAuthChange);
    window.addEventListener(AUTH_EVENTS.LOGOUT, handleAuthChange);

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGIN, handleAuthChange);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleAuthChange);
    };
  }, []);

  return (
    <nav className="main-navigation bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green !text-white px-4 py-3 shadow-md border-b-2 border-gray-900">
      {/* Debug info - remove in production */}
      {console.log('Navigation render - Auth state:', isAuthenticated)}

      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand - Acts as home link */}
        <div className="container mx-auto flex items-center">
          <Link
            to="/"
            className="group flex items-center transition-all duration-300 hover:scale-105"
          >
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-yellow-300">Mystic</span> Hits
            </span>
          </Link>

          {/* Navigation links - Desktop */}
          <div className="hidden md:flex space-x-6 ml-10">
            <Link
              to="/"
              className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
            >
              <Home className="h-4 w-4 mr-1 text-yellow-300" />
              Home
            </Link>
            <Link
              to="/charts"
              className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
            >
              <BarChart className="h-4 w-4 mr-1 text-yellow-300" />
              Charts
            </Link>
            <Link
              to="/about"
              className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
            >
              <Info className="h-4 w-4 mr-1 text-yellow-300" />
              About
            </Link>
            <Link
              to="/contact"
              className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-1 text-yellow-300" />
              Contact
            </Link>

            {/* Show Folders link for authenticated users */}
            {isAuthenticated && (
              <Link
                to="/folders"
                className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
              >
                <FolderIcon className="h-4 w-4 mr-1 text-yellow-300" />
                Folders
              </Link>
            )}

            {/* Show Admin link for admin users */}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="font-medium hover:text-yellow-400 transition-colors uppercase flex items-center"
              >
                <User className="h-4 w-4 mr-1 text-yellow-300" />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Auth buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Conditionally render logout button or auth dropdown */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 uppercase"
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          ) : (
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <User className="h-4 w-4 mr-1" />
                  Account <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-gray-800 border-gray-700 !shadow-lg !border !border-gray-700"
              >
                <DropdownMenuLabel className="text-gray-300">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="text-gray-200 focus:bg-gray-700 focus:text-white"
                  onSelect={() => {
                    closeDropdown();
                    navigate('/login');
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-200 focus:bg-gray-700 focus:text-white"
                  onSelect={() => {
                    closeDropdown();
                    navigate('/register');
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white p-1">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[80%] sm:w-[300px] bg-gray-900 border-r border-gray-800 !text-white !shadow-xl"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="!text-white text-xl flex items-center">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center"
                  >
                    <span className="text-xl font-bold tracking-tight">
                      <span className="text-yellow-300">Mystic</span> Hits
                    </span>
                  </Link>
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  Your premium music destination
                </SheetDescription>
              </SheetHeader>

              {/* Mobile navigation links */}
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-2 text-yellow-400" />
                  Home
                </Link>
                <Link
                  to="/charts"
                  className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart className="h-5 w-5 mr-2 text-yellow-400" />
                  Charts
                </Link>
                <Link
                  to="/about"
                  className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Info className="h-5 w-5 mr-2 text-yellow-400" />
                  About
                </Link>
                <Link
                  to="/contact"
                  className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-5 w-5 mr-2 text-yellow-400" />
                  Contact
                </Link>

                {/* Member section shown only when authenticated */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <Link
                      to="/folders"
                      className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FolderIcon className="h-5 w-5 mr-2 text-yellow-400" />
                      Folders
                    </Link>

                    {/* Admin link - only for admin users */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5 mr-2 text-yellow-400" />
                        Admin
                      </Link>
                    )}
                  </>
                )}

                <div className="h-px bg-gray-700 my-2"></div>

                {isAuthenticated ? (
                  <button
                    className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2 text-yellow-400" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5 mr-2 text-yellow-400" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5 mr-2 text-yellow-400" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
