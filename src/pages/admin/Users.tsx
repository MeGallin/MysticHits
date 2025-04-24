import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiUserX, FiUserCheck } from 'react-icons/fi';

const UsersPage: React.FC = () => {
  // This is a placeholder - in a real implementation, you would fetch users from the API
  const mockUsers = [
    {
      id: 1,
      email: 'admin@example.com',
      role: 'Admin',
      lastLogin: '2025-04-23',
    },
    {
      id: 2,
      email: 'user1@example.com',
      role: 'User',
      lastLogin: '2025-04-22',
    },
    {
      id: 3,
      email: 'user2@example.com',
      role: 'User',
      lastLogin: '2025-04-20',
    },
    {
      id: 4,
      email: 'user3@example.com',
      role: 'User',
      lastLogin: '2025-04-18',
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Add User
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Last Login
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.role === 'Admin' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.role}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2">
                    {user.role !== 'Admin' && (
                      <>
                        <button
                          className="text-blue-400 hover:text-blue-300"
                          title="Promote to Admin"
                        >
                          <FiUserCheck size={18} />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 ml-3"
                          title="Delete User"
                        >
                          <FiUserX size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium">4</span> users
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">
            Previous
          </button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white">
            1
          </button>
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
