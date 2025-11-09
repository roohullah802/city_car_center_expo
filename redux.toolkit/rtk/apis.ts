import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const Apis = createApi({
  reducerPath: 'cars',
   baseQuery: fetchBaseQuery({ 
      baseUrl: 'https://api.citycarcenters.com/api/user',
      prepareHeaders: async (headers, {getState})=>{
        const state = getState() as RootState;
        const token = state.user.token;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      }
     }),
  endpoints: builder => ({
    getCars: builder.query({
      query: () => '/all/cars',
    }),
    getBrands: builder.query({
      query: () => '/all/brands',
    }),
    getCarDetails: builder.query({
      query: _id => `/car/details/${_id}`,
    }),
    postReportIssue: builder.mutation({ 
      query: (data) => ({
        url: `/report/issue`,
        method: 'POST',
        body: data,
      }),
    }),
    getAllFaqs: builder.query({
      query:()=> '/all/faqs'
    }),
    getPolicy: builder.query({
      query: ()=> '/all/policy'
    }),

  }),
});

export const { useGetCarsQuery, useGetBrandsQuery, useGetCarDetailsQuery, usePostReportIssueMutation, useGetAllFaqsQuery, useGetPolicyQuery } =
  Apis;
