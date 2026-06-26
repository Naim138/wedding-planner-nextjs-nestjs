"use client";
import React, { useState } from 'react';
import BreadCrums from '@/components/BreadCrums';
import Loader from '@/components/Loader';
import ErrorComponent from '@/components/ErrorComponent';
import {
  useGetAllAdminServicesQuery,
  useToggleBlockServiceMutation,
  useDeleteAdminServiceMutation,
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
import { FaTrash, FaSearch, FaBan, FaCheckCircle } from 'react-icons/fa';

const AdminServices = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [remark, setRemark] = useState('');

  const { data: services, isLoading, isError } = useGetAllAdminServicesQuery({ search });
  const [toggleBlockService, { isLoading: isBlocking }] = useToggleBlockServiceMutation();
  const [deleteAdminService, { isLoading: isDeleting }] = useDeleteAdminServiceMutation();

  const handleOpenBlockModal = (service) => {
    setSelectedService(service);
    setRemark(service.remark || '');
    setModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedService) return;
    try {
      await toggleBlockService({
        id: selectedService._id,
        isAdminBlock: true,
        remark,
      }).unwrap();
      toast.success("Service package blocked successfully!");
      setModalOpen(false);
      setSelectedService(null);
      setRemark('');
    } catch (error) {
      toast.error(error?.data?.message || "Failed to block service");
    }
  };

  const handleUnblockService = async (serviceId) => {
    if (window.confirm("Are you sure you want to unblock this service?")) {
      try {
        await toggleBlockService({
          id: serviceId,
          isAdminBlock: false,
          remark: '',
        }).unwrap();
        toast.success("Service package unblocked!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to unblock service");
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service? This will remove the package and all its associated enquiries permanently.")) {
      try {
        await deleteAdminService(serviceId).unwrap();
        toast.success("Service package deleted!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete service");
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorComponent />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="Admin / Manage Services" />

      <div className="bg-white border border-zinc-200 rounded-md p-6 mt-6">
        <h1 className="text-2xl font-psmbold text-zinc-900 mb-6">Manage Service Packages</h1>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search services by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-logo transition-colors"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Publish Status</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services && services.length > 0 ? (
                services.map((cur) => (
                  <TableRow key={cur._id}>
                    <TableCell>
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-zinc-100 border border-zinc-200">
                        {cur.images && cur.images[0]?.uri ? (
                          <img
                            src={cur.images[0].uri}
                            alt={cur.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                            No Img
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-pmedium text-zinc-900">
                      <div>
                        <p className="line-clamp-1">{cur.title}</p>
                        {cur.isAdminBlock && cur.remark && (
                          <p className="text-[11px] text-red-500 font-pmedium">Blocked: {cur.remark}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 text-sm">
                      {cur.category?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-pmedium text-zinc-800">{cur.user?.name || 'N/A'}</p>
                        <p className="text-zinc-500 text-[11px]">{cur.user?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-pmedium text-zinc-950">
                      BDT {cur.budget ? cur.budget.toLocaleString() : '0'}
                    </TableCell>
                    <TableCell>
                      {cur.isPublish ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cur.isAdminBlock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-x-1">
                        {cur.isAdminBlock ? (
                          <button
                            onClick={() => handleUnblockService(cur._id)}
                            disabled={isBlocking}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-all"
                            title="Unblock Service"
                          >
                            <FaCheckCircle />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenBlockModal(cur)}
                            disabled={isBlocking}
                            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all"
                            title="Block Service"
                          >
                            <FaBan />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteService(cur._id)}
                          disabled={isDeleting}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                          title="Delete Service"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center font-pmedium text-zinc-400 py-8">
                    No service packages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Block Custom Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200 rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
            <h2 className="text-lg font-psmbold text-zinc-950 mb-2">Block Service Package</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Please enter a reason or remark for blocking the package <strong>{selectedService?.title}</strong>. This remark will be visible to the vendor.
            </p>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Inappropriate images, spam, pricing error..."
              rows={3}
              className="w-full border border-zinc-200 rounded-md p-3 text-sm focus:outline-none focus:border-logo mb-4"
            />
            <div className="flex justify-end gap-x-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedService(null);
                  setRemark('');
                }}
                className="px-4 py-2 text-sm font-pmedium border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                disabled={isBlocking}
                className="px-4 py-2 text-sm font-pmedium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                {isBlocking ? 'Blocking...' : 'Block Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
