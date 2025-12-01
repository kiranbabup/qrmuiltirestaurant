// store/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const LS_KEY = "notifications";

const loadFromLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const saveToLS = (list) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

const initialState = {
  notificationsList: loadFromLS(), // [] if nothing
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notificationsList.unshift(action.payload); // latest on top
      saveToLS(state.notificationsList);
    },
    clearNotifications: (state) => {
      state.notificationsList = [];
      saveToLS([]);
    },
    removeNotification: (state, action) => {
      const index = action.payload; // index of item in list
      if (
        typeof index === "number" &&
        index >= 0 &&
        index < state.notificationsList.length
      ) {
        state.notificationsList.splice(index, 1);
        saveToLS(state.notificationsList);
      }
    },
  },
});

export const { addNotification, clearNotifications,removeNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;