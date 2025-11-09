import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const Apis = createApi({
  reducerPath: 'auth',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.citycarcenters.com/api/user/auth',
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
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
        body: {},
      }),
    }),
    validateToken: builder.mutation({
      query: token => ({
        url: '/validate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const { useLogoutMutation, useValidateTokenMutation } = Apis;
