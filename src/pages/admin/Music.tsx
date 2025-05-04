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
      <div className="flex items-center mb-6">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-400 hover:text-white mr-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Music Management</h1>
      </div>

      {/* Playlists Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Playlists</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <FiPlus className="mr-2" /> New Playlist
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Songs
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Author
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
              {mockPlaylists.map((playlist) => (
                <tr key={playlist.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                    {playlist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {playlist.songs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {playlist.created}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {playlist.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-3">
                    <button className="text-blue-400 hover:text-blue-300">
                      <FiEdit2 size={18} />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Songs Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Songs</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <FiPlus className="mr-2" /> Add Song
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Artist
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Playlists
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
              {mockSongs.map((song) => (
                <tr key={song.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                    {song.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {song.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {song.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-300">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-3">
                    <button className="text-blue-400 hover:text-blue-300">
                      <FiMusic size={18} />
                    </button>
                    <button className="text-blue-400 hover:text-blue-300">
                      <FiEdit2 size={18} />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MusicPage;
