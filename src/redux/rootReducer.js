import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/authSlice";
import planReducer from "../feature/plan/planSlice";
import notificationReducer from "../feature/notification/notificationSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  plan: planReducer,
  notification: notificationReducer,
});

export default rootReducer;
