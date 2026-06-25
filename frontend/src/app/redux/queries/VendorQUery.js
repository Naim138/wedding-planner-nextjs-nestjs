import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from '../../../config/api'

const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const VendorQuery = createApi({
  reducerPath: 'VendorQuery',

  tagTypes: ['fetchAll', 'fetchById'],

  baseQuery: dynamicBaseQuery('/vendor'),

  endpoints: (build) => ({

    fetchAllEnquries: build.query({
      query: ({ status, search, from, to }) => ({
        url: `/enqueries?status=${status}&search=${search}&from=${from}&to=${to}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['fetchAll'],
    }),

    fetchEnquryById: build.query({
      query: (id) => ({
        url: `/enquery/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['fetchById'],
    }),

    updateEnqueryById: build.mutation({
      query: ({ id, data }) => ({
        url: `/enquery/status/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['fetchById'],
    }),

  }),
})

export const {
  useFetchAllEnquriesQuery,
  useFetchEnquryByIdQuery,
  useUpdateEnqueryByIdMutation
} = VendorQuery
