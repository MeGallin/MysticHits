import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Menu, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';

/**
 * Navigation component that displays the site navigation bar
 * Responsive design with mobile menu and auth dropdown
 */
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to close dropdown menu
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white px-4 py-3 shadow-md border-b-2 border-gray-900">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand - Acts as home link */}
        <Link to="/" className="font-bold text-lg uppercase">
          Mystic Hits
        </Link>

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

          {/* Auth Dropdown - Completely Redesigned */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-1 hover:bg-white/20 transition-all duration-200 flex items-center gap-1.5 group"
              >
                <User className="h-4 w-4 mr-1 text-yellow-300 group-hover:text-yellow-400 transition-colors" />
                <span>Account</span>
                <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-70 group-hover:opacity-100 group-data-[state=open]:rotate-180 transition-all" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={5}
              alignOffset={0}
              className="w-56 bg-gradient-to-b from-gray-800 to-gray-900 border-0 rounded-lg shadow-xl p-2 before:content-[''] before:absolute before:top-0 before:right-5 before:w-3 before:h-3 before:bg-gray-800 before:-translate-y-1.5 before:rotate-45 before:border-t-0 before:border-l-0 animate-in zoom-in-95 origin-[var(--radix-dropdown-menu-content-transform-origin)]"
            >
              <DropdownMenuLabel className="text-gray-300 text-xs uppercase font-semibold tracking-wider px-2 pt-1 pb-2.5">
                Authentication
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10 my-1" />

              <DropdownMenuItem className="rounded-md focus:bg-white/10 transition-all duration-200 my-1 py-2.5 cursor-pointer data-[highlighted]:bg-white/10 data-[highlighted]:outline-none">
                <Link
                  to="/login"
                  className="w-full flex items-center text-white hover:text-yellow-400 font-medium"
                  onClick={closeDropdown}
                >
                  <LogIn
                    className="h-4 w-4 mr-2 text-yellow-300"
                    strokeWidth={2.5}
                  />
                  <span>Sign In</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md focus:bg-white/10 transition-all duration-200 my-1 py-2.5 cursor-pointer data-[highlighted]:bg-white/10 data-[highlighted]:outline-none">
                <Link
                  to="/register"
                  className="w-full flex items-center text-white hover:text-yellow-400 font-medium"
                  onClick={closeDropdown}
                >
                  <UserPlus
                    className="h-4 w-4 mr-2 text-yellow-300"
                    strokeWidth={2.5}
                  />
                  <span>Create Account</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navigation;
