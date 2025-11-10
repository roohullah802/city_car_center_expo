import { createSlice } from "@reduxjs/toolkit";

const securitySlice = createSlice({
    name: 'security',
    initialState: {
        isLocked: false
    },
    reducers: {
        setLocked: (state, action) =>{
            state.isLocked = action.payload
        }
    }
})

export const { setLocked } = securitySlice.actions;
export default securitySlice.reducer;