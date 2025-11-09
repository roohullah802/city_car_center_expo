import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { RootState } from '../store';

export const Api = createApi({
    reducerPath: 'payment',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.citycarcenters.com/api/payment',
        prepareHeaders: (headers, {getState})=> {
            const state = getState() as RootState;
            const token = state?.user?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers

        }
    }),
    endpoints: builder => ({
        createPaymentIntend: builder.mutation({
            query: ({id, startDate, endDate})=>({
                url:`/create-payment-intent/${id}`,
                method: 'POST',
                body: {startDate, endDate}
            })
        }),
        paymentIntentForExtendLease: builder.mutation({
            query: ({id, additionalDays})=>({
                url: `/create-payment-intent-for-extend-lease/${id}`,
                method: 'POST',
                body:{additionalDays}
            })
        })
    })
})

export const {useCreatePaymentIntendMutation, usePaymentIntentForExtendLeaseMutation} = Api;