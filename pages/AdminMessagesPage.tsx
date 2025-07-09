
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Message } from '../types';
import { Link } from 'react-router-dom';

const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Failed to fetch messages. ' + error.message);
      console.error(error);
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (message: Message) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: !message.is_read })
      .eq('id', message.id);
    
    if (error) {
      alert('Error updating message status: ' + error.message);
    } else {
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: !m.is_read } : m));
      if(selectedMessage && selectedMessage.id === message.id) {
          setSelectedMessage(prev => prev ? {...prev, is_read: !prev.is_read} : null);
      }
    }
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message permanently?')) {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        alert('Error deleting message: ' + error.message);
      } else {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
      }
    }
  };
  
  const handleRowClick = (message: Message) => {
      setSelectedMessage(message);
      if(!message.is_read) {
          handleToggleRead(message);
      }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Contact Form Messages</h1>
        <Link to="/admin/dashboard" className="text-sm text-amber-600 hover:text-amber-800">&larr; Back to Dashboard</Link>
      </div>

      {loading && <div className="text-center p-8">Loading messages...</div>}
      {error && <div className="text-center p-8 text-red-500 bg-red-50 rounded-md">{error}</div>}

      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-xl overflow-hidden">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">There are no messages to display.</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
                {/* Message List */}
                <div className="w-full md:w-1/3 border-r-0 md:border-r pr-0 md:pr-4 overflow-y-auto max-h-[70vh]">
                     {messages.map(message => (
                        <div 
                            key={message.id} 
                            onClick={() => handleRowClick(message)}
                            className={`p-3 border-b cursor-pointer transition-colors ${selectedMessage?.id === message.id ? 'bg-amber-100' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`font-semibold ${!message.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{message.subject}</h3>
                                {!message.is_read && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>}
                            </div>
                            <p className="text-sm text-gray-700 truncate">{message.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(message.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Message Detail View */}
                <div className="w-full md:w-2/3">
                    {selectedMessage ? (
                         <div className="p-4 bg-gray-50 rounded-lg h-full flex flex-col">
                            <div className="pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">{selectedMessage.subject}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    From: <span className="font-medium text-gray-700">{selectedMessage.name}</span> ({selectedMessage.email})
                                </p>
                                 <p className="text-xs text-gray-500">
                                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="py-4 whitespace-pre-wrap text-gray-700 leading-relaxed flex-grow">
                                {selectedMessage.message}
                            </div>
                            <div className="pt-4 border-t flex justify-end items-center gap-3">
                                <button
                                    onClick={() => handleToggleRead(selectedMessage)}
                                    className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500 bg-gray-50 rounded-lg p-8">
                            <div>
                                <i className="far fa-envelope-open text-5xl text-gray-300 mb-4"></i>
                                <p>Select a message from the left to view its details.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
