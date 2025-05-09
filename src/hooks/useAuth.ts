import { useAtom } from 'jotai';
import {
  authStateAtom,
  isAuthenticatedAtom,
  isAdminAtom,
  userAtom,
  tokenAtom,
  login as loginFn,
  logout as logoutFn,
} from '../state/authAtoms';

/**
 * Custom hook for accessing authentication state and functions
 *
 * This hook is a drop-in replacement for the previous useAuth hook from AuthContext,
 * ensuring backward compatibility while using Jotai for state management.
 */
export function useAuth() {
  const [authState] = useAtom(authStateAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [user] = useAtom(userAtom);
  const [token] = useAtom(tokenAtom);

  return {
    isAuthenticated,
    isAdmin,
    user,
    token,
    login: loginFn,
    logout: logoutFn,
  };
}

export default useAuth;
