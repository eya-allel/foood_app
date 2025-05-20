import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CatererChat = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    // Only caterers should access this page
    if (!currentUser || currentUser.role !== 'caterer') {
      navigate('/');
      return;
    }

    fetchMessages();
  }, [currentUser, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/received');
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setReplyContent('');
    setReplySuccess(false);

    // Mark as read if not already
    if (!message.read) {
      try {
        await api.put(`/messages/read/${message._id}`);
        
        // Update the message in the list
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === message._id ? { ...msg, read: true } : msg
          )
        );
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !selectedMessage) {
      return;
    }
    
    setSendingReply(true);
    
    try {
      await api.post(`/messages/reply/${selectedMessage._id}`, {
        content: replyContent
      });
      
      setReplyContent('');
      setReplySuccess(true);
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Message Center</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="bg-gray-100 text-center py-8 rounded">
          <p className="text-gray-600">You don't have any messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Message list */}
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold mb-3">Inbox</h2>
            <div className="bg-white rounded shadow-sm divide-y overflow-hidden">
              {messages.map(message => (
                <div 
                  key={message._id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50
                            ${selectedMessage?._id === message._id ? 'bg-amber-50' : ''}
                            ${!message.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">
                      {message.senderName}
                    </div>
                    {!message.read && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-gray-700 truncate">
                    {message.content.substring(0, 60)}
                    {message.content.length > 60 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Message detail and reply */}
          <div className="md:w-2/3">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <h2 className="text-xl font-semibold">
                      From: {selectedMessage.senderName}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col text-sm text-gray-600 mb-4">
                    <div>Email: {selectedMessage.senderEmail}</div>
                    {selectedMessage.senderPhone && <div>Phone: {selectedMessage.senderPhone}</div>}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap my-4">
                    {selectedMessage.content}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Reply</h3>
                  
                  {replySuccess ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
                      Your reply has been sent successfully!
                    </div>
                  ) : (
                    <form onSubmit={handleReply}>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        rows="4"
                        placeholder="Type your reply here..."
                        required
                      ></textarea>
                      
                      <button
                        type="submit"
                        disabled={sendingReply}
                        className={`mt-3 px-4 py-2 rounded font-medium text-white transition
                                  ${sendingReply 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-amber-500 hover:bg-amber-600'}`}
                      >
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatererChat;