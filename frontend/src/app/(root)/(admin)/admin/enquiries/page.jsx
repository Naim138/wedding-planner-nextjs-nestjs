"use client";
import React, { useState } from 'react';
import BreadCrums from '@/components/BreadCrums';
import Loader from '@/components/Loader';
import ErrorComponent from '@/components/ErrorComponent';
import {
  useGetAllAdminEnquiriesQuery,
  useDeleteAdminEnquiryMutation,
} from '@/app/redux/queries/AdminQuery';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'react-toastify';
import { FaTrash, FaSearch } from 'react-icons/fa';

const AdminEnquiries = () => {
  const [search, setSearch] = useState('');

  const { data: enquiries, isLoading, isError } = useGetAllAdminEnquiriesQuery({ search });
  const [deleteAdminEnquiry, { isLoading: isDeleting }] = useDeleteAdminEnquiryMutation();

  const handleDeleteEnquiry = async (enquiryId) => {
    if (window.confirm("Are you sure you want to delete this booking enquiry?")) {
      try {
        await deleteAdminEnquiry(enquiryId).unwrap();
        toast.success("Enquiry deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete enquiry");
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorComponent />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="Admin / Manage Enquiries" />

      <div className="bg-white border border-zinc-200 rounded-md p-6 mt-6">
        <h1 className="text-2xl font-psmbold text-zinc-900 mb-6">Manage Booking Enquiries</h1>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by client name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-logo transition-colors"
            />
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Details</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Service Package</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries && enquiries.length > 0 ? (
                enquiries.map((cur) => (
                  <TableRow key={cur._id}>
                    <TableCell>
                      <div>
                        <p className="font-pmedium text-zinc-900">{cur.name}</p>
                        <p className="text-zinc-500 text-xs">{cur.email}</p>
                        <p className="text-zinc-500 text-xs">{cur.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 text-sm max-w-[200px]">
                      <p className="line-clamp-2" title={cur.message}>{cur.message}</p>
                    </TableCell>
                    <TableCell className="text-sm font-pmedium text-zinc-800">
                      {cur.service?.title || (
                        <span className="text-zinc-400 italic">Deleted Package</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cur.service?.user ? (
                        <div>
                          <p className="font-pmedium text-zinc-800">{cur.service.user.name}</p>
                          <p className="text-zinc-500 text-[11px]">{cur.service.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {cur.service?.category?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cur.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        cur.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {cur.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {new Date(cur.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDeleteEnquiry(cur._id)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                        title="Delete Enquiry"
                      >
                        <FaTrash />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center font-pmedium text-zinc-400 py-8">
                    No booking enquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
