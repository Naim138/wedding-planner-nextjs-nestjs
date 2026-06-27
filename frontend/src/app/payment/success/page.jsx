"use client";
import { useMainContext } from '@/context/MainContext';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosClient from '@/utils/axiosClient';

const PaymentSuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { fetchUserProfile } = useMainContext();
    const paymentId = searchParams.get('paymentId');
    const tranId = searchParams.get('tran_id');
    const status = searchParams.get('status');

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Call backend callback to process payment
                if (tranId && status) {
                    await axiosClient.post('/payment/sslcommerz/callback', {
                        tran_id: tranId,
                        status: status,
                        val_id: searchParams.get('val_id'),
                    });
                }
                
                if (paymentId) {
                    toast.success('Payment completed successfully!');
                    await fetchUserProfile();
                }

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } catch (error) {
                console.error('Payment processing error:', error);
                toast.error('Payment processing failed');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            }
        };

        processPayment();
    }, [paymentId, tranId, status, router, fetchUserProfile, searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center px-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20 text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <FaCheckCircle className="text-8xl text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                <p className="text-green-200 mb-8">
                    Your payment has been processed successfully. Your vendor account is now active.
                </p>
                <p className="text-green-300 text-sm">
                    Redirecting to dashboard...
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
