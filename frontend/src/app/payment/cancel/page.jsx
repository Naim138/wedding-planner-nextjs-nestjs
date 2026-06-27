"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';

const PaymentCancelPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('paymentId');
    const tranId = searchParams.get('tran_id');
    const status = searchParams.get('status');

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Call backend callback to process cancellation
                if (tranId && status) {
                    await axiosClient.post('/payment/sslcommerz/callback', {
                        tran_id: tranId,
                        status: status,
                        val_id: searchParams.get('val_id'),
                    });
                }
                
                if (paymentId) {
                    toast.error('Payment was cancelled');
                }

                // Redirect to payment page after 3 seconds
                setTimeout(() => {
                    router.push('/payment');
                }, 3000);
            } catch (error) {
                console.error('Payment processing error:', error);
                toast.error('Payment processing failed');
                setTimeout(() => {
                    router.push('/payment');
                }, 3000);
            }
        };

        processPayment();
    }, [paymentId, tranId, status, router, searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 flex items-center justify-center px-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20 text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <FaTimesCircle className="text-8xl text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
                <p className="text-red-200 mb-8">
                    Your payment was cancelled. You can try again whenever you're ready.
                </p>
                <p className="text-red-300 text-sm">
                    Redirecting to payment page...
                </p>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
