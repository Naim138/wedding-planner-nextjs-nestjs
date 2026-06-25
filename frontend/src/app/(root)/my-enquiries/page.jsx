"use client";
import React, { useEffect, useState } from 'react';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { CgSpinner } from 'react-icons/cg';
import { MdOutlineDateRange, MdMoney, MdCategory } from 'react-icons/md';
import BreadCrums from '@/components/BreadCrums';

const MyEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.get("/auth/my-enquiries", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEnquiries(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    let baseClass = "px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ";
    switch (s) {
      case 'APPROVED':
      case 'ACCEPTED':
        return <span className={baseClass + "bg-green-100 text-green-800 border border-green-200"}>{s}</span>;
      case 'ATTENDED':
        return <span className={baseClass + "bg-blue-100 text-blue-800 border border-blue-200"}>{s}</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className={baseClass + "bg-red-100 text-red-800 border border-red-200"}>{s}</span>;
      default:
        return <span className={baseClass + "bg-amber-100 text-amber-800 border border-amber-200"}>{s}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="My Enquiries" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <CgSpinner className="animate-spin text-6xl text-logo mb-4" />
          <p className="text-zinc-600 font-medium">Fetching your enquiries...</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-150 p-12 text-center max-w-xl mx-auto my-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-psmbold text-zinc-900 mb-2">No Enquiries Found</h2>
          <p className="text-zinc-500 mb-6">You haven't contacted any vendors yet. Explore our wedding service listings to get started!</p>
          <Link href="/" className="inline-block px-6 py-3 bg-logo hover:bg-logo/90 text-white font-psmbold rounded-lg transition-colors">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {enquiries.map((enq) => {
            const service = enq.service || {};
            const category = service.category || {};
            const vendor = service.user || {};
            const dateStr = new Date(enq.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={enq._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 p-6 flex flex-col justify-between transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(enq.status)}
                    <span className="flex items-center text-xs text-zinc-500 gap-x-1">
                      <MdOutlineDateRange className="text-sm" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-xl font-psmbold text-zinc-900 mb-2">
                    {service.title || 'Wedding Service'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4 text-sm text-zinc-600">
                    <span className="flex items-center gap-x-1 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                      <MdCategory className="text-logo text-base" />
                      {category.name || 'N/A'}
                    </span>
                    <span className="flex items-center gap-x-1 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                      <MdMoney className="text-green-600 text-base" />
                      Budget: ${service.budget || 'N/A'}
                    </span>
                  </div>

                  {/* Enquiry message */}
                  <div className="bg-whitesmoke p-4 rounded-xl border border-zinc-100 text-sm text-zinc-700 mb-4">
                    <p className="font-semibold text-zinc-500 text-xs uppercase mb-1">Your Message:</p>
                    <p className="italic">"{enq.message}"</p>
                  </div>

                  {/* Vendor remarks */}
                  {(enq.remark || enq.isAdminRemark) && (
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-sm text-indigo-950 mb-4">
                      {enq.remark && (
                        <div className="mb-2">
                          <p className="font-semibold text-indigo-700 text-xs uppercase mb-1">Vendor Feedback:</p>
                          <p className="font-medium">"{enq.remark}"</p>
                        </div>
                      )}
                      {enq.isAdminRemark && (
                        <div>
                          <p className="font-semibold text-rose-700 text-xs uppercase mb-1">Admin Remark:</p>
                          <p className="font-medium">"{enq.isAdminRemark}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    <p>Vendor: <span className="font-semibold text-zinc-700">{vendor.name || 'N/A'}</span></p>
                    <p>Email: <span className="font-semibold text-zinc-700">{vendor.email || 'N/A'}</span></p>
                  </div>
                  {category.slug && service.slug && (
                    <Link
                      href={`/service/view?category=${encodeURIComponent(category.slug)}&service=${encodeURIComponent(service.slug)}`}
                      className="px-4 py-2 text-xs font-semibold text-logo hover:text-white bg-transparent hover:bg-logo border border-logo rounded-lg transition-all duration-300"
                    >
                      View Service
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEnquiriesPage;
