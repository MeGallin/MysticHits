import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiMail,
  FiTrash2,
  FiStar,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

const MessagesPage: React.FC = () => {
  // This is a placeholder - in a real implementation, you would fetch messages from the API
  const mockMessages = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Website Feedback',
      message:
        'Love the new playlist feature! Great job with the latest update.',
      date: '2025-04-23',
      read: true,
      important: false,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      subject: 'Technical Issue',
      message:
        'I encountered an issue when trying to create a playlist. The page freezes after I click "Save".',
      date: '2025-04-22',
      read: false,
      important: true,
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael@example.com',
      subject: 'Music Suggestion',
      message:
        'Would love to see more jazz music in the collection. Any plans to add more jazz artists?',
      date: '2025-04-22',
      read: false,
      important: false,
    },
    {
      id: 4,
      name: 'Emily Johnson',
      email: 'emily@example.com',
      subject: 'Partnership Inquiry',
      message:
        'I represent XYZ Music and we would be interested in discussing potential partnership opportunities.',
      date: '2025-04-21',
      read: true,
      important: true,
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david@example.com',
      subject: 'Account Question',
      message:
        "How do I change my password? I couldn't find the option in my account settings.",
      date: '2025-04-20',
      read: true,
      important: false,
    },
  ];

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, unread, important

  const filteredMessages = mockMessages.filter((message) => {
    if (filter === 'unread') return !message.read;
    if (filter === 'important') return message.important;
    return true;
  });

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'important'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setFilter('important')}
              >
                Important
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-gray-700/70' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {!message.read && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        <span
                          className={`font-medium ${
                            message.read ? 'text-gray-400' : 'text-white'
                          }`}
                        >
                          {message.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {message.important && (
                          <FiStar className="text-yellow-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {message.date}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`mt-1 ${
                        message.read ? 'text-gray-400' : 'text-gray-200'
                      }`}
                    >
                      {message.subject}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 truncate">
                      {message.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-400 text-center">
                  No messages match the current filter
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Display */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 h-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {selectedMessage.subject}
                </h2>
                <div className="flex space-x-2">
                  <button
                    className="p-2 hover:bg-gray-700 rounded-full"
                    title="Mark as important"
                  >
                    <FiStar
                      className={
                        selectedMessage.important
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }
                    />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-700 rounded-full"
                    title="Delete message"
                  >
                    <FiTrash2 className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <div>
                  <div className="flex items-center mb-1">
                    <FiMail className="text-gray-400 mr-2" />
                    <span className="text-white">{selectedMessage.name}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {selectedMessage.email}
                  </div>
                </div>
                <div className="text-gray-400 text-sm flex items-center">
                  <FiClock className="mr-1" /> {selectedMessage.date}
                </div>
              </div>

              <div className="text-gray-300 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-700">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                  <FiMail className="mr-2" /> Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
              <FiMail className="text-gray-600 w-16 h-16 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">
                Select a message to view
              </h3>
              <p className="text-gray-500">No message selected</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;
