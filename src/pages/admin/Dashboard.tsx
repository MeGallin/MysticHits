import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../../state/authAtoms';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiUsers,
  FiMusic,
  FiBarChart2,
  FiMessageSquare,
  FiActivity,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import services from '../../services/fetchServices';
import HealthCard from '../../components/admin/HealthCard';
import HitAnalyticsWidget from '../../components/admin/HitAnalyticsWidget';

const AdminDashboard: React.FC = () => {
  const [user] = useAtom(userAtom);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    unread: 0,
    important: 0,
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all messages
        const allMessages = await services.adminServices.getMessages();
        // Get unread messages
        const unreadMessages = await services.adminServices.getMessages(
          'unread',
        );
        // Get important messages
        const importantMessages = await services.adminServices.getMessages(
          'important',
        );

        // Get users
        const usersResponse = await services.adminServices.getUsers();

        if (
          allMessages.success &&
          unreadMessages.success &&
          importantMessages.success
        ) {
          setMessageStats({
            total: allMessages.data?.length || 0,
            unread: unreadMessages.data?.length || 0,
            important: importantMessages.data?.length || 0,
          });
        }

        if (usersResponse.success) {
          const users = usersResponse.data || [];
          setUserStats({
            total: users.length,
            admins: users.filter((u: any) => u.isAdmin).length,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
          <p className="text-gray-300 text-sm sm:text-base">
            Welcome,{' '}
            <span className="text-white font-medium">{user?.email}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Link
          to="/admin/messages"
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-6 rounded-lg border border-amber-500/30 flex items-start hover:from-amber-500/30 hover:to-amber-600/30 transition-all group"
        >
          <FiMessageSquare className="h-10 w-10 text-amber-400 mr-4 group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white flex items-center">
              Messages
              {messageStats.unread > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {messageStats.unread} new
                </span>
              )}
            </h2>
            <p className="text-amber-200 mb-2">Manage contact messages</p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-amber-600/20 rounded px-2 py-1 text-center">
                <div className="text-white text-sm font-medium">
                  {messageStats.total}
                </div>
                <div className="text-amber-200 text-xs">Total</div>
              </div>
              <div className="bg-amber-600/20 rounded px-2 py-1 text-center">
                <div className="text-yellow-400 text-sm font-medium">
                  {messageStats.important}
                </div>
                <div className="text-amber-200 text-xs">Important</div>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-lg border border-blue-500/30 flex items-start hover:from-blue-500/30 hover:to-blue-600/30 transition-all group"
        >
          <FiUsers className="h-10 w-10 text-blue-400 mr-4 group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">
              User Management
            </h2>
            <p className="text-blue-200 mb-2">Manage user accounts</p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-blue-600/20 rounded px-2 py-1 text-center">
                <div className="text-white text-sm font-medium">
                  {loading ? '...' : userStats.total}
                </div>
                <div className="text-blue-200 text-xs">Total Users</div>
              </div>
              <div className="bg-blue-600/20 rounded px-2 py-1 text-center">
                <div className="text-blue-300 text-sm font-medium">
                  {loading ? '...' : userStats.admins}
                </div>
                <div className="text-blue-200 text-xs">Admins</div>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/music"
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30 flex items-center hover:from-purple-500/30 hover:to-purple-600/30 transition-all group"
        >
          <FiMusic className="h-10 w-10 text-purple-400 mr-4 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              Music Management
            </h2>
            <p className="text-purple-200">Manage playlists and songs</p>
          </div>
        </Link>

        <Link
          to="/admin/insights"
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-lg border border-emerald-500/30 flex items-center hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all group"
        >
          <FiActivity className="h-10 w-10 text-emerald-400 mr-4 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-lg font-semibold text-white">User Insights</h2>
            <p className="text-emerald-200">Active users & top tracks</p>
          </div>
        </Link>

        <Link
          to="/admin/listening-analytics"
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30 flex items-center hover:from-purple-500/30 hover:to-purple-600/30 transition-all group"
        >
          <FiActivity className="h-10 w-10 text-purple-400 mr-4 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              Listening Analytics
            </h2>
            <p className="text-purple-200">Comprehensive user listening data</p>
          </div>
        </Link>

        <Link
          to="/admin/stats"
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-lg border border-green-500/30 flex items-center hover:from-green-500/30 hover:to-green-600/30 transition-all group"
        >
          <FiBarChart2 className="h-10 w-10 text-green-400 mr-4 group-hover:scale-110 transition-transform" />
          <div>
            <h2 className="text-lg font-semibold text-white">Statistics</h2>
            <p className="text-green-200">View site analytics</p>
          </div>
        </Link>
      </div>

      {/* Add Hit Analytics Widget */}
      <div className="mb-6">
        <HitAnalyticsWidget days={7} autoRefresh={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Activities
          </h2>
          <div className="space-y-3">
            <p className="text-gray-300">• New user registration (today)</p>
            <p className="text-gray-300">• Playlist updated (yesterday)</p>
            <p className="text-gray-300">• System maintenance (2 days ago)</p>
          </div>
        </div>

        <HealthCard />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
