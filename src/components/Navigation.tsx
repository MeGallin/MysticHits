import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogIn, UserPlus, ChevronDown, LogOut } from 'lucide-react';
import { logoutUser } from '@services/fetchServices';
import { AUTH_EVENTS, isAuthenticated } from '../utils/authUtils';

/**
 * Navigation component that displays the site navigation bar
 * Responsive design with mobile menu and auth dropdown
 */
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const navigate = useNavigate();

  // Function to update auth state
  const updateAuthState = () => {
    setIsLoggedIn(isAuthenticated());
  };

  // Listen for authentication events
  useEffect(() => {
    // Set initial auth state
    updateAuthState();

    // Add event listeners for login and logout events
    window.addEventListener(AUTH_EVENTS.LOGIN, updateAuthState);
    window.addEventListener(AUTH_EVENTS.LOGOUT, updateAuthState);

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGIN, updateAuthState);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, updateAuthState);
    };
  }, []);

  // Function to close dropdown menu
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white px-4 py-3 shadow-md border-b-2 border-gray-900">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand - Acts as home link */}
        <div className="container mx-auto flex items-center">
          <Link
            to="/"
            className="group flex items-center transition-all duration-300 hover:scale-105"
          >
            <div className="mr-2 relative">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
                MYSTIC HITS
              </span>
              <div className="flex items-center">
                <span className="h-px w-4 bg-gradient-to-r from-transparent to-yellow-400"></span>
                <span className="font-normal text-xs text-white/80 tracking-wider mx-1 italic">
                  Enjoy the VIBES!
                </span>
                <span className="h-px flex-grow bg-gradient-to-r from-yellow-400 to-transparent"></span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Home link removed - Logo now serves as home link */}
          <Link
            to="/about"
            className="font-medium hover:text-yellow-400 transition-colors uppercase"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="font-medium hover:text-yellow-400 transition-colors uppercase"
          >
            Contact
          </Link>

          {/* Conditionally render logout button or auth dropdown */}
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-1 hover:bg-white/20 transition-all duration-200 flex items-center gap-1.5 group"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1 text-yellow-300 group-hover:text-yellow-400 transition-colors" />
              <span>Logout</span>
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
                  className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border-none text-white rounded-lg px-4 py-1.5 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2 group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-pink-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <div className="relative z-10 flex items-center">
                    <div className="bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full p-0.5 mr-2">
                      <User className="h-4 w-4 text-white drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-medium text-white/90 group-hover:text-white transition-colors">
                      Account
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 ml-1 text-yellow-400/80 group-hover:text-yellow-400 group-data-[state=open]:rotate-180 transition-all duration-300" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={5}
                alignOffset={0}
                className="w-64 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-purple-500/10 p-3 before:content-[''] before:absolute before:top-0 before:right-5 before:w-3 before:h-3 before:bg-gray-900/95 before:backdrop-blur-xl before:-translate-y-1.5 before:rotate-45 before:border-t before:border-l before:border-white/10 animate-in zoom-in-95 duration-200 origin-[var(--radix-dropdown-menu-content-transform-origin)]"
              >
                <div className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-80 rounded-t-md"></div>

                  <DropdownMenuLabel className="text-white/90 font-bold text-base tracking-wide px-2 pt-3 pb-2 flex items-center">
                    <div className="bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full p-1.5 mr-3 shadow-md shadow-purple-500/20">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    Account Options
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-white/10 my-2" />

                  <div className="space-y-1 px-1 py-2">
                    <DropdownMenuItem className="rounded-lg focus:bg-white/10 transition-all duration-200 cursor-pointer data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-indigo-500/20 data-[highlighted]:to-purple-600/20 data-[highlighted]:outline-none">
                      <Link
                        to="/login"
                        className="w-full flex items-center text-white group px-2 py-2"
                        onClick={closeDropdown}
                      >
                        <div className="bg-gradient-to-br from-indigo-500/80 to-purple-700/80 rounded-md p-1.5 mr-2.5 group-hover:shadow-md group-hover:shadow-purple-500/20 transition-all duration-200">
                          <LogIn
                            className="h-4 w-4 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-yellow-400 transition-colors">
                            Login
                          </span>
                          <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                            Access your account
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="rounded-lg focus:bg-white/10 transition-all duration-200 cursor-pointer data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-indigo-500/20 data-[highlighted]:to-purple-600/20 data-[highlighted]:outline-none">
                      <Link
                        to="/register"
                        className="w-full flex items-center text-white group px-2 py-2"
                        onClick={closeDropdown}
                      >
                        <div className="bg-gradient-to-br from-pink-500/80 to-purple-700/80 rounded-md p-1.5 mr-2.5 group-hover:shadow-md group-hover:shadow-purple-500/20 transition-all duration-200">
                          <UserPlus
                            className="h-4 w-4 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-yellow-400 transition-colors">
                            Create Account
                          </span>
                          <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                            Join Mystic Hits
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-1"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-gray-900 text-white border-gray-800"
          >
            <div className="flex flex-col space-y-4 mt-8">
              <Link
                to="/"
                className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="font-medium text-lg hover:text-yellow-400 transition-colors uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="h-px bg-gray-700 my-2"></div>

              {isLoggedIn ? (
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
    </nav>
  );
};

export default Navigation;
