import { configureStore,createSlice } from "@reduxjs/toolkit";
const initialState={
    status:false
}

const isRegisterSlice=createSlice({
    name:'isRegisterSlice',
    initialState,
    reducers:{
        toggleRegister:(state)=>{
            state.status=!state.status
        }
    }
})

export const {toggleRegister}=isRegisterSlice.actions;

const store = configureStore({
    reducer: {
        isRegisterSlice: isRegisterSlice.reducer,
    },
});

export default store;
