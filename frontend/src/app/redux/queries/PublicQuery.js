import { createApi } from '@reduxjs/toolkit/query/react'
import { dynamicBaseQuery } from '../../../config/api'

// Define a service using a base URL and expected endpoints
export const PublicServiceQuery = createApi({
    reducerPath: 'PublicServiceQuery',
    tagTypes:[],
    baseQuery: dynamicBaseQuery('/public'),
    endpoints: (build) => ({
        
        alllCateries:build.query({
            query: () => ({
                url: `/all-categories`,
                method: 'GET',
            }),
        }),
        // get popular categories
            popularCateries:build.query({
                query: () => ({
                    url: `/categories`,
                    method: 'GET',
                }),
            }),
            popularServices:build.query({
                query: () => ({
                    url: `/services`,
                    method: 'GET',
                }),
            }),
            allServices:build.query({
                query: () => ({
                    url: `/all-services`,
                    method: 'GET',
                }),
            }),
            
            allServicesBySlug:build.query({
                query: (slug) => ({
                    url: `/all-services/`+slug,
                    method: 'GET',
                }),
            }),
            
            getServiceBySlug:build.query({
                query: ({category,service}) => ({
                    url: `service/${category}/${service}`,
                    method: 'GET',
                }),
            }),
            sendEnquery:build.mutation({
                query: ({service,data}) => ({
                    url: `enquery/${service}`,
                    method: 'POST',
                    body:data
                }),
            }),
            
            
      
            
    }),
  })
  export const { 
        usePopularCateriesQuery,
        usePopularServicesQuery,
        useAlllCateriesQuery,
        useAllServicesQuery,
        useAllServicesBySlugQuery,
        useGetServiceBySlugQuery,
        useSendEnqueryMutation
  } = PublicServiceQuery  
