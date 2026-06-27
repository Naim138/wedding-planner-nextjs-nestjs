"use client";
import CustomButton from '@/components/CustomButton';
import { useMainContext } from '@/context/MainContext';
import { useCreateVendorRegistrationMutation, useCreateVendorSubscriptionMutation, useGetMyPaymentsQuery } from '@/app/redux/queries/PaymentQuery';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const { userProfile } = useMainContext();
    const router = useRouter();
    const [paymentType, setPaymentType] = useState('registration');
    
    const { data: payments, isLoading: loadingPayments } = useGetMyPaymentsQuery();
    const [createRegistration, { isLoading: loadingRegistration }] = useCreateVendorRegistrationMutation();
    const [createSubscription, { isLoading: loadingSubscription }] = useCreateVendorSubscriptionMutation();

    useEffect(() => {
        if (userProfile?.role !== 'vendor') {
            router.push('/dashboard');
            return;
        }

        // Check if registration is already paid
        if (userProfile?.vendorRegistrationPaid) {
            setPaymentType('subscription');
        }
    }, [userProfile, router]);

    const handlePayment = async () => {
        try {
            let result;

            if (paymentType === 'registration') {
                result = await createRegistration().unwrap();
            } else {
                result = await createSubscription().unwrap();
            }

            if (result?.paymentUrl) {
                // Open SSLCommerz in new tab to avoid popup blocking
                window.open(result.paymentUrl, '_blank');
            } else {
                toast.error('Failed to generate payment URL');
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || 'Payment initiation failed');
        }
    };

    const amount = paymentType === 'registration' ? 500 : 1000;
    const title = paymentType === 'registration' ? 'Vendor Registration Fee' : 'Monthly Subscription';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">{title}</h1>
                    <p className="text-indigo-200 text-center mb-8">Complete your payment to activate your vendor account</p>

                    {/* Payment Amount Card */}
                    <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-indigo-200">Amount to Pay</span>
                            <span className="text-3xl font-bold text-white">৳{amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-indigo-300">Currency</span>
                            <span className="text-white">BDT</span>
                        </div>
                    </div>

                    {/* Payment Method Info */}
                    <div className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-white font-semibold mb-3">Payment Methods</h3>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm">bKash</span>
                            <span className="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-sm">Nagad</span>
                            <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">Rocket</span>
                        </div>
                        <p className="text-indigo-300 text-sm mt-3">You will be able to select your preferred payment method on the SSLCommerz payment page.</p>
                    </div>

                    {/* Payment Button */}
                    <CustomButton
                        className="w-full py-4 text-lg"
                        type="button"
                        isLoading={loadingRegistration || loadingSubscription}
                        label={`Pay ৳${amount} with SSLCommerz`}
                        onClick={handlePayment}
                    />

                    {/* Payment History */}
                    {payments && payments.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Payment History</h2>
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {payment.purpose === 'vendor_registration' ? 'Registration' : 'Subscription'}
                                                </p>
                                                <p className="text-indigo-300 text-sm">
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-semibold">৳{payment.amount}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    payment.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                    payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
