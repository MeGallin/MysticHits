import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import UserFolderList from '../../components/admin/UserFolderList';
import {
  FiArrowLeft,
  FiFolder,
  FiUsers,
  FiPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import services from '../../services/fetchServices';
import folderServices from '../../services/folderServices';
import { Link, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface User {
  _id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

const AdminFoldersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    label: '',
    path: '',
    userIds: [] as string[],
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Check if user was pre-selected from navigation state
    const state = location.state as {
      selectedUserId?: string;
      selectedUserName?: string;
    } | null;
    if (state?.selectedUserId && state?.selectedUserName) {
      setSelectedUserId(state.selectedUserId);
      setSelectedUserName(state.selectedUserName);
    }
  }, [location.state]);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  const handleBulkAdd = async () => {
    if (
      !bulkFormData.label ||
      !bulkFormData.path ||
      bulkFormData.userIds.length === 0
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select at least one user.',
        variant: 'destructive',
      });
      return;
    }

    setBulkLoading(true);
    try {
      const response = await folderServices.bulkAddFolders(
        bulkFormData.userIds,
        {
          label: bulkFormData.label,
          path: bulkFormData.path,
        },
      );

      if (response.success && response.data) {
        const { successful, failed } = response.data;

        toast({
          title: 'Bulk Add Complete',
          description: `Successfully added to ${successful.length} users. ${
            failed.length > 0 ? `Failed for ${failed.length} users.` : ''
          }`,
        });

        // Close dialog and reset form
        setIsBulkDialogOpen(false);
        setBulkFormData({ label: '', path: '', userIds: [] });
      } else {
        throw new Error(response.error || 'Failed to bulk add folders');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to bulk add folders',
        variant: 'destructive',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setBulkFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  const selectAllUsers = () => {
    setBulkFormData((prev) => ({
      ...prev,
      userIds: filteredUsers.map((user) => user._id),
    }));
  };

  const clearSelection = () => {
    setBulkFormData((prev) => ({
      ...prev,
      userIds: [],
    }));
  };

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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
            <FiFolder className="mr-3" />
            Folder Management
          </h1>

          <div className="flex gap-2">
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <FiPlus className="h-4 w-4" />
                  Bulk Add Folders
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Add Folders to Users</DialogTitle>
                  <DialogDescription>
                    Add the same folder to multiple users at once.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulk-label">Folder Label</Label>
                    <Input
                      id="bulk-label"
                      value={bulkFormData.label}
                      onChange={(e) =>
                        setBulkFormData((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      placeholder="e.g., My Music Collection"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bulk-path">Folder Path</Label>
                    <Input
                      id="bulk-path"
                      value={bulkFormData.path}
                      onChange={(e) =>
                        setBulkFormData((prev) => ({
                          ...prev,
                          path: e.target.value,
                        }))
                      }
                      placeholder="e.g., /path/to/folder or https://example.com/music"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>
                        Select Users ({bulkFormData.userIds.length} selected)
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllUsers}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {filteredUsers.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={bulkFormData.userIds.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {user.username} ({user.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsBulkDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAdd} disabled={bulkLoading}>
                    {bulkLoading
                      ? 'Adding...'
                      : `Add to ${bulkFormData.userIds.length} users`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <FiUsers className="mr-2" />
                  Users ({filteredUsers.length})
                </h2>
              </div>

              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() =>
                      handleUserSelect(user._id, user.username || user.email)
                    }
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUserId === user._id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="font-medium text-white">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-300">{user.email}</div>
                    {user.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-600 text-white rounded">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No users found
                </div>
              )}
            </Card>
          </div>

          {/* Folder Management Panel */}
          <div className="lg:col-span-2">
            {selectedUserId ? (
              <UserFolderList
                userId={selectedUserId}
                userName={selectedUserName}
                onPlayFolder={(userId, folderId) => {
                  // Could implement admin folder preview functionality
                  toast({
                    title: 'Info',
                    description: 'Admin folder preview not yet implemented',
                  });
                }}
              />
            ) : (
              <Card className="bg-gray-800/50 border-gray-700 p-8 text-center">
                <FiFolder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  Select a User
                </h3>
                <p className="text-gray-400">
                  Choose a user from the list to view and manage their folders.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFoldersPage;
