import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/user');
        setOrders(response.data.data);
        
        // Select first order by default if there are orders
        if (response.data.data.length > 0) {
          setSelectedOrder(response.data.data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
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

  // Check overall status of order
  const getOrderOverallStatus = (items) => {
    if (!items?.length) return 'pending';
    
    const statuses = {
      rejected: 0,
      pending: 0,
      accepted: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0
    };
    
    items.forEach(item => {
      statuses[item.status || 'pending']++;
    });
    
    if (statuses.rejected === items.length) return 'rejected';
    if (statuses.delivered === items.length) return 'delivered';
    if (statuses.shipped > 0) return 'shipped';
    if (statuses.preparing > 0) return 'preparing';
    if (statuses.accepted > 0) return 'accepted';
    return 'pending';
  };

  // Get a summary of item statuses for display
  const getOrderStatusSummary = (items) => {
    if (!items?.length) return '0 items';
    
    const statuses = {
      rejected: 0,
      pending: 0,
      accepted: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0
    };
    
    items.forEach(item => {
      statuses[item.status || 'pending'] += item.quantity || 1;
    });
    
    const summary = [];
    for (const [status, count] of Object.entries(statuses)) {
      if (count > 0) {
        summary.push(`${count} ${status}`);
      }
    }
    
    return summary.join(', ');
  };

  if (loading) return <div className="p-4 flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>;
  
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => getOrderOverallStatus(order.items) === statusFilter);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-600">You don't have any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Controls */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="font-semibold">Filter Orders</h2>
              </div>
              <div className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          
            {/* Orders List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="font-semibold">Orders List</h2>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No orders match the selected filter
                </div>
              ) : (
                <ul className="divide-y max-h-[500px] overflow-y-auto">
                  {filteredOrders.map((order) => (
                    <li
                      key={order._id}
                      className={`cursor-pointer hover:bg-gray-50 transition ${selectedOrder?._id === order._id ? 'bg-orange-50' : ''}`}
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="px-4 py-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Order #{order._id.slice(-6)}</span>
                          {getOrderStatusBadge(getOrderOverallStatus(order.items))}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>{order.items.length} items · {order.totalAmount.toFixed(2)} TD</p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs mt-1">{getOrderStatusSummary(order.items)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                  <div className="mt-2">
                    {getOrderStatusBadge(getOrderOverallStatus(selectedOrder.items))}
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                      <p className="text-sm">
                        {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}<br />
                        {selectedOrder.address?.street}<br />
                        {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}<br />
                        {selectedOrder.address?.country}<br />
                        {selectedOrder.address?.phone}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h3>
                      <p>{selectedOrder.method === 'cod' ? 'Cash on Delivery' : selectedOrder.method}</p>
                      
                      <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">Order Summary</h3>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{(selectedOrder.totalAmount - 7).toFixed(2)} TD</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span>7.00 TD</span>
                        </div>
                        <div className="flex justify-between font-semibold mt-1">
                          <span>Total:</span>
                          <span>{selectedOrder.totalAmount.toFixed(2)} TD</span>
                        </div>
                      </div>
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
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
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

export default UserOrders;