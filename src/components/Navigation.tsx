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
  Music,
  Headphones,
  Radio,
  Mic2,
} from 'lucide-react';
import { logoutUser } from '@services/fetchServices';
import { useAtom } from 'jotai';
import {
  isAuthenticatedAtom,
  isAdminAtom,
  logout,
  userAtom,
} from '../state/authAtoms';
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
  const [currentUser] = useAtom(userAtom);
  const navigate = useNavigate();
  const location = useLocation();

  // Force re-render when location changes
  useEffect(() => {
    // This effect runs when route changes, helping ensure nav reflects current auth state
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

  // Format user display name - use email or extract username from email
  const getUserDisplayName = () => {
    if (!currentUser || !currentUser.email) {
      return 'User';
    }

    // Extract username from email (before the @)
    // This creates a more personalized display name from the email address
    const username = currentUser.email.split('@')[0];

    // Replace dots and underscores with spaces for a more natural name
    const formattedName = username
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return formattedName;
  };

  // User profile UI component for consistent display
  const UserProfileDisplay = ({ compact = false }) => {
    if (!currentUser || !currentUser.email) return null;

    const displayName = getUserDisplayName();

    if (compact) {
      // Compact version for mobile menu
      return (
        <div className="flex items-center mb-3 px-2 py-2 bg-gray-800 rounded-md">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gradient bg-gradient-to-r from-pink-300 via-yellow-200 to-purple-300 text-transparent bg-clip-text">
              Hello, {displayName}!
            </span>
            <span
              className="text-xs text-gray-400 truncate"
              title={currentUser.email}
            >
              {currentUser.email}
            </span>
          </div>
        </div>
      );
    }

    // Full version for dropdown
    return (
      <div className="px-3 py-2 flex items-center bg-gray-700 rounded mx-2 my-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold mr-2">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{displayName}</span>
          <span
            className="text-xs text-gray-300 truncate"
            title={currentUser.email}
          >
            {currentUser.email}
          </span>
        </div>
      </div>
    );
  };

  // Listen for auth events to ensure UI updates
  useEffect(() => {
    const handleAuthChange = () => {
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
    <nav className="main-navigation bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-900 text-white px-4 py-3 shadow-lg border-b-2 border-gray-900">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand - Acts as home link */}
        <div className="flex items-center">
          <Link
            to="/"
            className="group flex items-center transition-all duration-300 hover:scale-105 logo-hover"
          >
            <Headphones
              className="h-8 w-8 mr-2 text-pink-400 animate-pulse filter drop-shadow-lg text-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 0.5rem rgba(236, 72, 153, 0.7))',
              }}
            />
            <div className="flex flex-col items-center">
              <span className="text-xl md:text-2xl font-bold tracking-tight font-logo">
                <span className="text-pink-400 bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text">
                  Mystic
                </span>
                <span className="text-yellow-300"> Hits</span>
              </span>
              <span className="text-[12px] font-slogan bg-gradient-to-r from-pink-300 via-yellow-200 to-purple-300 text-transparent bg-clip-text -mt-1 tracking-[0.2em] uppercase animate-pulse slogan-text">
                ★ Feel the Vibes ★
              </span>
            </div>
          </Link>
        </div>

        {/* Right side container - Navigation links + Auth buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Navigation links - Desktop */}
          <Link
            to="/charts"
            className="font-medium font-sans hover:text-pink-400 transition-colors uppercase flex items-center"
          >
            <BarChart className="h-4 w-4 mr-1 text-pink-400" />
            Charts
          </Link>
          <Link
            to="/about"
            className="font-medium font-sans hover:text-pink-400 transition-colors uppercase flex items-center"
          >
            <Info className="h-4 w-4 mr-1 text-pink-400" />
            About
          </Link>
          <Link
            to="/contact"
            className="font-medium font-sans hover:text-pink-400 transition-colors uppercase flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-1 text-pink-400" />
            Contact
          </Link>

          {/* Show Folders link for authenticated users */}
          {isAuthenticated && (
            <Link
              to="/folders"
              className="font-medium font-sans hover:text-pink-400 transition-colors uppercase flex items-center"
            >
              <FolderIcon className="h-4 w-4 mr-1 text-pink-400" />
              Folders
            </Link>
          )}

          {/* Show Admin link for admin users */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="font-medium font-sans hover:text-pink-400 transition-colors uppercase flex items-center"
            >
              <User className="h-4 w-4 mr-1 text-pink-400" />
              Admin
            </Link>
          )}

          {/* Auth buttons */}
          <div className="flex items-center ml-4 pl-4 border-l border-gray-700">
            {/* Conditionally render logout button or auth dropdown */}
            {isAuthenticated ? (
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2 text-yellow-300" />
                    <span className="font-semibold">
                      {getUserDisplayName()}
                    </span>{' '}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-gray-800 !shadow-lg !border border-gray-700"
                >
                  <DropdownMenuLabel className="text-pink-400">
                    Account
                  </DropdownMenuLabel>
                  <UserProfileDisplay />{' '}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {/* Profile settings option */}
                  <DropdownMenuItem
                    className="text-gray-200 focus:bg-gray-700 focus:text-pink-400"
                    onSelect={() => {
                      closeDropdown();
                      navigate('/profile');
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  {/* Only Logout option for authenticated users */}
                  <DropdownMenuItem
                    className="text-gray-200 focus:bg-gray-700 focus:text-pink-400"
                    onSelect={() => {
                      handleLogout();
                      closeDropdown();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 text-white hover:bg-gray-800 hover:text-pink-400 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2 text-gray-300" />
                    <span>Account</span>{' '}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-gray-800 !shadow-lg !border border-gray-700"
                >
                  <DropdownMenuLabel className="text-pink-400">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    className="text-gray-200 focus:bg-gray-700 focus:text-pink-400"
                    onSelect={() => {
                      closeDropdown();
                      navigate('/login');
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-200 focus:bg-gray-700 focus:text-pink-400"
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
                    className="flex items-center logo-hover"
                  >
                    <Headphones
                      className="h-6 w-6 mr-2 text-pink-400 animate-pulse filter drop-shadow-lg"
                      style={{
                        filter:
                          'drop-shadow(0 0 0.5rem rgba(236, 72, 153, 0.7))',
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold tracking-tight font-logo">
                        <span className="text-pink-400 bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text">
                          Mystic
                        </span>
                        <span className="text-yellow-300"> Hits</span>
                      </span>
                      <span className="text-[12px] font-slogan bg-gradient-to-r from-pink-300 via-yellow-200 to-purple-300 text-transparent bg-clip-text -mt-1 tracking-[0.2em] uppercase animate-pulse slogan-text">
                        ★ Feel the Vibes ★
                      </span>
                    </div>
                  </Link>
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  Your premium music destination
                </SheetDescription>
              </SheetHeader>

              {/* Mobile navigation links */}
              <div className="flex flex-col space-y-4">
                <Link
                  to="/charts"
                  className="font-medium font-sans text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart className="h-5 w-5 mr-2 text-pink-400" />
                  Charts
                </Link>
                <Link
                  to="/about"
                  className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Info className="h-5 w-5 mr-2 text-pink-400" />
                  About
                </Link>
                <Link
                  to="/contact"
                  className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-5 w-5 mr-2 text-pink-400" />
                  Contact
                </Link>

                {/* Member section shown only when authenticated */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <Link
                      to="/folders"
                      className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FolderIcon className="h-5 w-5 mr-2 text-pink-400" />
                      Folders
                    </Link>

                    {/* Admin link - only for admin users */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5 mr-2 text-pink-400" />
                        Admin
                      </Link>
                    )}
                  </>
                )}

                <div className="h-px bg-gray-700 my-2"></div>

                {isAuthenticated ? (
                  <>
                    <UserProfileDisplay compact />
                    <button
                      className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2 text-pink-400" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5 mr-2 text-pink-400" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="font-medium text-lg hover:text-pink-400 transition-colors uppercase flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5 mr-2 text-pink-400" />
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Music-themed decorative elements */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-8 opacity-80">
                <Music
                  className="h-8 w-8 text-pink-400 transform hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 0.3rem rgba(236, 72, 153, 0.7))',
                  }}
                />
                <Radio
                  className="h-8 w-8 text-yellow-300 transform hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 0.3rem rgba(252, 211, 77, 0.7))',
                  }}
                />
                <Mic2
                  className="h-8 w-8 text-purple-400 transform hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 0.3rem rgba(192, 132, 252, 0.7))',
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
