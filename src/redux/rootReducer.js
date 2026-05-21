import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer;
