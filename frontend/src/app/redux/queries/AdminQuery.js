import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from '../../../config/api'

const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const AdminQuery = createApi({
  reducerPath: 'AdminQuery',
  tagTypes: ['AdminUsers', 'AdminServices', 'AdminEnquiries'],
  baseQuery: dynamicBaseQuery('/admin'),
  endpoints: (build) => ({
    getAllUsers: build.query({
      query: ({ role = '', search = '' }) => ({
        url: `/users?role=${role}&search=${search}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['AdminUsers'],
    }),

    updateUserRole: build.mutation({
      query: ({ id, role }) => ({
        url: `/users/role/${id}`,
        method: 'PUT',
        body: { role },
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['AdminUsers'],
    }),

    deleteUser: build.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['AdminUsers', 'AdminServices', 'AdminEnquiries'],
    }),

    getAllAdminServices: build.query({
      query: ({ search = '' }) => ({
        url: `/services?search=${search}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['AdminServices'],
    }),

    toggleBlockService: build.mutation({
      query: ({ id, isAdminBlock, remark }) => ({
        url: `/services/block/${id}`,
        method: 'PUT',
        body: { isAdminBlock, remark },
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['AdminServices'],
    }),

    deleteAdminService: build.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['AdminServices'],
    }),

    getAllAdminEnquiries: build.query({
      query: ({ search = '' }) => ({
        url: `/enquiries?search=${search}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['AdminEnquiries'],
    }),

    deleteAdminEnquiry: build.mutation({
      query: (id) => ({
        url: `/enquiries/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['AdminEnquiries'],
    }),
  }),
})

export const {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAllAdminServicesQuery,
  useToggleBlockServiceMutation,
  useDeleteAdminServiceMutation,
  useGetAllAdminEnquiriesQuery,
  useDeleteAdminEnquiryMutation,
} = AdminQuery
