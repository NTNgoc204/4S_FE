import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/authSlice";
import planReducer from "../feature/plan/planSlice";
import notificationReducer from "../feature/notification/notificationSlice";
import adminReducer from "../feature/admin/adminSlice";
import questionReducer from "../feature/question/questionSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  plan: planReducer,
  notification: notificationReducer,
  admin: adminReducer,
  question: questionReducer,
});

export default rootReducer;
