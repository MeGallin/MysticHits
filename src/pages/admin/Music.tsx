import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiMusic,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiArrowLeft,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MusicPage: React.FC = () => {
  // This is a placeholder - in a real implementation, you would fetch music data from the API
  const mockPlaylists = [
    {
      id: 1,
      name: 'Top Hits',
      songs: 12,
      created: '2025-03-12',
      author: 'Admin',
    },
    {
      id: 2,
      name: '80s Collection',
      songs: 24,
      created: '2025-03-15',
      author: 'Admin',
    },
    {
      id: 3,
      name: 'Rock Classics',
      songs: 18,
      created: '2025-03-20',
      author: 'Editor',
    },
    {
      id: 4,
      name: 'Jazz Standards',
      songs: 15,
      created: '2025-04-05',
      author: 'Editor',
    },
    {
      id: 5,
      name: 'Ambient Music',
      songs: 9,
      created: '2025-04-10',
      author: 'Admin',
    },
  ];

  const mockSongs = [
    {
      id: 1,
      title: 'Do You Feel Like We Do',
      artist: 'Peter Frampton',
      duration: '3:45',
      playlists: ['Top Hits'],
    },
    {
      id: 2,
      title: 'Show Me the Way',
      artist: 'Peter Frampton',
      duration: '4:12',
      playlists: ['Top Hits', '80s Collection'],
    },
    {
      id: 3,
      title: 'Africa',
      artist: 'Toto',
      duration: '4:55',
      playlists: ['80s Collection', 'Rock Classics'],
    },
    {
      id: 4,
      title: "Don't Chain My Heart",
      artist: 'Toto',
      duration: '4:08',
      playlists: ['80s Collection'],
    },
    {
      id: 5,
      title: 'Pamela',
      artist: 'Toto',
      duration: '5:10',
      playlists: ['Rock Classics'],
    },
  ];

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
            Music Management
          </h1>
        </div>

        {/* Playlists Section */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiMusic className="mr-2" /> Playlists
              </h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                <FiPlus className="mr-2" /> New Playlist
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Songs
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {mockPlaylists.map((playlist) => (
                    <tr key={playlist.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                        {playlist.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {playlist.songs}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {playlist.created}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {playlist.author}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 px-2"
                          >
                            <FiEdit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
                          >
                            <FiTrash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Songs Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiMusic className="mr-2" /> Songs
              </h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                <FiPlus className="mr-2" /> Add Song
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Playlists
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {mockSongs.map((song) => (
                    <tr key={song.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                        {song.title}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {song.artist}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {song.duration}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-normal text-sm text-gray-300">
                        <div className="flex flex-wrap gap-1">
                          {song.playlists.map((playlist, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 rounded-full text-xs"
                            >
                              {playlist}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 px-2"
                          >
                            <FiMusic size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 px-2"
                          >
                            <FiEdit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
                          >
                            <FiTrash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MusicPage;
