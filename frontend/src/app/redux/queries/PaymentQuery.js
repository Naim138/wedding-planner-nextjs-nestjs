import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from '../../../config/api'

const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const PaymentQuery = createApi({
  reducerPath: 'PaymentQuery',

  tagTypes: ['payments'],

  baseQuery: dynamicBaseQuery('/payment'),

  endpoints: (build) => ({

    createVendorRegistration: build.mutation({
      query: () => ({
        url: `/vendor-registration`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['payments'],
    }),

    createVendorSubscription: build.mutation({
      query: () => ({
        url: `/vendor-subscription`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: ['payments'],
    }),

    getMyPayments: build.query({
      query: () => ({
        url: `/my-payments`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: ['payments'],
    }),

  }),
})

export const {
  useCreateVendorRegistrationMutation,
  useCreateVendorSubscriptionMutation,
  useGetMyPaymentsQuery
} = PaymentQuery
