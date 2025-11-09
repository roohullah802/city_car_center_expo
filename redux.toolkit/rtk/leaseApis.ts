import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const Apis = createApi({
  reducerPath: 'lease',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.citycarcenters.com/api/user',
    prepareHeaders: async (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state?.user?.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    getAllActiveLeases: builder.query({
      query: () => '/all/active/leases',
    }),
    getLeaseDetails: builder.query({
      query: (id)=> `/lease/details/${id}`
    }),
    getPaymentDetails: builder.query({
      query: ()=> '/car/payment/history'
    }),
    getAllLeases: builder.query({
      query: () => '/leases',
    }),



  }),
});

export const { useGetAllActiveLeasesQuery, useGetLeaseDetailsQuery, useGetPaymentDetailsQuery, useGetAllLeasesQuery } = Apis;
