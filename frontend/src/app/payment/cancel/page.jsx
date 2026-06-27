"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PaymentCancelPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('paymentId');

    useEffect(() => {
        if (paymentId) {
            toast.error('Payment was cancelled');
        }

        // Redirect to payment page after 3 seconds
        const timer = setTimeout(() => {
            router.push('/payment');
        }, 3000);

        return () => clearTimeout(timer);
    }, [paymentId, router]);

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
