"use client";
import React, { useState } from 'react';
import BreadCrums from '@/components/BreadCrums';
import Loader from '@/components/Loader';
import ErrorComponent from '@/components/ErrorComponent';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from '@/app/redux/queries/AdminQuery';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'react-toastify';
import { FaTrash, FaSearch } from 'react-icons/fa';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');

  const { data: users, isLoading, isError } = useGetAllUsersQuery({ role, search });
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will delete all their data, checklists, services, and enquiries.")) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete user");
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorComponent />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="Admin / Manage Users & Vendors" />
      
      <div className="bg-white border border-zinc-200 rounded-md p-6 mt-6">
        <h1 className="text-2xl font-psmbold text-zinc-900 mb-6">Manage Users & Vendors</h1>
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-logo transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-x-2">
            <span className="text-sm font-pmedium text-zinc-600">Filter by Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-logo bg-white font-pmedium"
            >
              <option value="all">All Roles</option>
              <option value="user">Couple (User)</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((cur) => (
                  <TableRow key={cur._id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={cur.avatar || "https://github.com/shadcn.png"} alt={cur.name} />
                        <AvatarFallback>{cur.name ? cur.name.slice(0,2).toUpperCase() : 'US'}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-pmedium text-zinc-900">{cur.name}</TableCell>
                    <TableCell className="text-zinc-600">{cur.email}</TableCell>
                    <TableCell>
                      {cur.role === 'admin' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                          Admin
                        </span>
                      ) : (
                        <select
                          value={cur.role}
                          onChange={(e) => handleRoleChange(cur._id, e.target.value)}
                          disabled={isUpdating}
                          className="border border-zinc-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-logo font-pmedium"
                        >
                          <option value="user">Couple</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </TableCell>
                    <TableCell>
                      {cur.isEmailVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {new Date(cur.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {cur.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(cur._id)}
                          disabled={isDeleting}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center font-pmedium text-zinc-400 py-8">
                    No users found matching filters
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

export default AdminUsers;
