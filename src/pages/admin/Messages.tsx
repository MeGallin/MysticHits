import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiMail,
  FiTrash2,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
} from 'react-icons/fi';
import services from '../../services/fetchServices';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Use these directly from the services object
const { getMessages, getMessage, updateMessage, deleteMessage } =
  services.adminServices;

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  important: boolean;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('all'); // all, unread, important
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Fetch messages based on current filter
  const fetchMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getMessages(filter);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setError(response.error || 'Failed to fetch messages');
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch messages',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when component mounts or filter changes
  useEffect(() => {
    fetchMessages();
  }, [filter]);

  // Fetch single message details
  const handleSelectMessage = async (message: Message) => {
    try {
      // If already selected, just show it
      if (selectedMessage?.id === message.id) return;

      // Get full message details (this will also mark it as read)
      const response = await getMessage(message.id);
      if (response.success && response.data) {
        setSelectedMessage(response.data);

        // Update the message in the list to show as read
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.id === message.id ? { ...m, read: true } : m,
          ),
        );
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load message details',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load message details',
        variant: 'destructive',
      });
    }
  };

  // Toggle important flag
  const handleToggleImportant = async () => {
    if (!selectedMessage) return;

    try {
      const newImportantValue = !selectedMessage.important;
      const response = await updateMessage(selectedMessage.id, {
        important: newImportantValue,
      });

      if (response.success && response.data) {
        // Update selected message
        setSelectedMessage({
          ...selectedMessage,
          important: newImportantValue,
        });

        // Update in message list
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.id === selectedMessage.id
              ? { ...m, important: newImportantValue }
              : m,
          ),
        );

        toast({
          title: 'Success',
          description: `Message marked as ${
            newImportantValue ? 'important' : 'not important'
          }`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update message',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive',
      });
    }
  };

  // Toggle read status
  const handleToggleRead = async () => {
    if (!selectedMessage) return;

    try {
      const newReadValue = !selectedMessage.read;
      const response = await updateMessage(selectedMessage.id, {
        read: newReadValue,
      });

      if (response.success && response.data) {
        // Update selected message
        setSelectedMessage({
          ...selectedMessage,
          read: newReadValue,
        });

        // Update in message list
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.id === selectedMessage.id ? { ...m, read: newReadValue } : m,
          ),
        );

        toast({
          title: 'Success',
          description: `Message marked as ${newReadValue ? 'read' : 'unread'}`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update message',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive',
      });
    }
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await deleteMessage(selectedMessage.id);

      if (response.success) {
        // Remove from message list
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m.id !== selectedMessage.id),
        );

        // Clear selected message
        setSelectedMessage(null);

        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete message',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  if (loading && messages.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading messages...</div>
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
            Messages
          </h1>
        </div>

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
              <button
                onClick={fetchMessages}
                className="p-2 text-gray-300 hover:text-white"
                title="Refresh messages"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
              {loading && messages.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <FiRefreshCw
                    className="animate-spin mx-auto mb-2"
                    size={24}
                  />
                  Loading messages...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-400">
                  <FiAlertCircle className="mx-auto mb-2" size={24} />
                  {error}
                  <button
                    onClick={fetchMessages}
                    className="block mx-auto mt-2 text-blue-400 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                          selectedMessage?.id === message.id
                            ? 'bg-gray-700/70'
                            : ''
                        }`}
                        onClick={() => handleSelectMessage(message)}
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
              )}
            </div>
          </div>

          {/* Message Display */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 h-full">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 hover:bg-gray-700 rounded-full"
                      title={
                        selectedMessage.read ? 'Mark as unread' : 'Mark as read'
                      }
                      onClick={handleToggleRead}
                    >
                      <FiCheckCircle
                        className={
                          selectedMessage.read
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 hover:bg-gray-700 rounded-full"
                      title={
                        selectedMessage.important
                          ? 'Remove importance'
                          : 'Mark as important'
                      }
                      onClick={handleToggleImportant}
                    >
                      <FiStar
                        className={
                          selectedMessage.important
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                        }
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 hover:bg-gray-700 rounded-full"
                      title="Delete message"
                      onClick={handleDeleteMessage}
                    >
                      <FiTrash2 className="text-gray-400 hover:text-red-400" />
                    </Button>
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
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                  >
                    <FiMail className="mr-2" /> Reply
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 h-full flex flex-col items-center justify-center text-center">
                <FiMail className="text-gray-600 w-16 h-16 mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  Select a message to view
                </h3>
                <p className="text-gray-500">No message selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;
