"use client";
import React, { useEffect, useState } from 'react';
import axiosClient from '@/utils/axiosClient';
import { toast } from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/payment/all-payments');
      setPayments(response.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (paymentId) => {
    try {
      await axiosClient.patch(`/payment/${paymentId}/activate`);
      toast.success('Account activated successfully');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to activate account');
      console.error(error);
    }
  };

  const handleReject = async (paymentId) => {
    try {
      await axiosClient.patch(`/payment/${paymentId}/reject`);
      toast.success('Payment rejected');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to reject payment');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.user?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.purpose === 'vendor_registration' 
                        ? 'Vendor Registration' 
                        : 'Monthly Subscription'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ৳{payment.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleActivate(payment._id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Activate Account
                      </button>
                    )}
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleReject(payment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
