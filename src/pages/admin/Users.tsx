import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiUserX, FiArrowLeft } from 'react-icons/fi';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import services from '../../services/fetchServices';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface User {
  _id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Helper function to check if a user is the current user
  const isCurrentUser = (userId: string): boolean => {
    return !!currentUser && userId === currentUser.id;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await services.adminServices.getUsers();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Prevent deleting yourself
    if (isCurrentUser(userId)) {
      toast({
        title: 'Action not allowed',
        description: 'You cannot delete your own account.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await services.adminServices.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      setUsers(users.filter((user) => user._id !== userId));
      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleRoleToggle = async (userId: string, newIsAdmin: boolean) => {
    // Prevent changing your own admin status
    if (isCurrentUser(userId)) {
      toast({
        title: 'Action not allowed',
        description: 'You cannot modify your own admin rights.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await services.adminServices.changeUserRole(
        userId,
        newIsAdmin,
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user role');
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isAdmin: newIsAdmin } : user,
        ),
      );

      toast({
        title: 'Role Updated',
        description: `User role has been ${
          newIsAdmin ? 'upgraded to admin' : 'changed to regular user'
        }.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  // Renders a deletion alert dialog for a user
  const renderDeleteAlert = (user: User) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
        >
          <FiUserX size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {user.email}? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDeleteUser(user._id)}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-full">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <div className="flex items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            User Management
          </h1>
        </div>

        {/* Mobile card view (hidden on md and larger screens) */}
        <div className="block md:hidden space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-white">{user.username}</h3>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
                <div>
                  {user.isAdmin ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      User
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center">
                  <span className="text-sm text-gray-300 mr-3">
                    Admin Status:
                  </span>
                  <Switch
                    checked={user.isAdmin}
                    disabled={isCurrentUser(user._id)}
                    onCheckedChange={(checked: boolean) =>
                      handleRoleToggle(user._id, checked)
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div>
                  {!user.isAdmin &&
                    currentUser &&
                    user._id !== currentUser.id &&
                    renderDeleteAlert(user)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view (hidden on smaller screens) */}
        <div className="hidden md:block bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Admin Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.username}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {user.isAdmin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Switch
                        checked={user.isAdmin}
                        disabled={isCurrentUser(user._id)}
                        onCheckedChange={(checked: boolean) =>
                          handleRoleToggle(user._id, checked)
                        }
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {!user.isAdmin &&
                        currentUser &&
                        user._id !== currentUser.id &&
                        renderDeleteAlert(user)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
