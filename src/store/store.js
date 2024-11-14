import { configureStore,createSlice } from "@reduxjs/toolkit";
const initialState={
    status:false
}

const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        setLoginStatus:(state, action) => {
            state.status = action.payload;
          },
    }
})

export const {setLoginStatus}=authSlice.actions;

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
    },
});

export default store;
