import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/authSlice";
import planReducer from "../feature/plan/planSlice";
import notificationReducer from "../feature/notification/notificationSlice";
import adminReducer from "../feature/admin/adminSlice";
import questionReducer from "../feature/question/questionSlice";
import chatReducer from "../feature/chat/chatSlice";
import universityReducer from "../feature/university/universitySlice";
import eduReducer from "../feature/edu/eduSlice";
import themeReducer from "../feature/theme/themeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  plan: planReducer,
  notification: notificationReducer,
  admin: adminReducer,
  question: questionReducer,
  chat: chatReducer,
  university: universityReducer,
  edu: eduReducer,
  theme: themeReducer,
});

export default rootReducer;
