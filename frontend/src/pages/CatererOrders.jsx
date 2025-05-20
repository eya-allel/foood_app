import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const CatererOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/caterer');
      setOrders(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleAcceptOrder = async (orderId, items) => {
    try {
      setProcessingAction(true);
      const response = await api.post('/orders/accept', { 
        orderId,
        items: items.map(item => item.recipeId) 
      });
      
      if (response.data.success) {
        toast.success('Order items accepted successfully');
        fetchOrders(); // Refresh orders list
        setSelectedOrder(null); // Reset selected order
      } else {
        toast.error(response.data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Error accepting order. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectOrder = async (orderId, items) => {
    try {
      setProcessingAction(true);
      const response = await api.post('/orders/reject', { 
        orderId,
        items: items.map(item => item.recipeId) 
      });
      
      if (response.data.success) {
        toast.success('Order items rejected');
        fetchOrders(); // Refresh orders list
        setSelectedOrder(null); // Reset selected order
      } else {
        toast.error(response.data.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Error rejecting order. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      preparing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-gray-100 text-gray-800",
      canceled: "bg-gray-100 text-gray-500"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-4 flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>;
  
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-600">You don't have any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Orders List */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="font-semibold">Orders List</h2>
              </div>
              <ul className="divide-y">
                {orders.map((order) => (
                  <li
                    key={order._id}
                    className={`cursor-pointer hover:bg-gray-50 transition ${selectedOrder?._id === order._id ? 'bg-orange-50' : ''}`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Order #{order._id.slice(-6)}</span>
                        {getOrderStatusBadge(order.items[0]?.status || "pending")}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <p>Items: {order.items.length}</p>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="w-full md:w-2/3">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold mb-1">Order #{selectedOrder._id.slice(-6)}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
                      <p className="font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                      <p className="text-sm">
                        {selectedOrder.address?.street}<br />
                        {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}<br />
                        {selectedOrder.address?.country}<br />
                        {selectedOrder.address?.phone}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="overflow-hidden border rounded-lg">
                    <table className="min-w-full divide-y">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.recipeId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.image && (
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded object-cover" src={item.image} alt={item.name} />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.price} TD
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getOrderStatusBadge(item.status || 'pending')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    {selectedOrder.items.some(item => !item.status || item.status === 'pending') && (
                      <>
                        <button
                          onClick={() => handleRejectOrder(selectedOrder._id, selectedOrder.items.filter(item => !item.status || item.status === 'pending'))}
                          disabled={processingAction}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject Order
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(selectedOrder._id, selectedOrder.items.filter(item => !item.status || item.status === 'pending'))}
                          disabled={processingAction}
                          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                          Accept Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatererOrders;