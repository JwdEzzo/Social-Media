import { createSlice } from "@reduxjs/toolkit";

interface ViewPostModalState {
  isOpen: boolean;
  selectedPostId: number | null;
}

const ViewPostModalInitialState: ViewPostModalState = {
  isOpen: false,
  selectedPostId: null,
};

export const viewPostModalSlice = createSlice({
  name: "viewPostModal",
  initialState: ViewPostModalInitialState,
  reducers: {
    openPostModal: (state, action) => {
      state.isOpen = true;
      state.selectedPostId = action.payload;
    },
    closePostModal: (state) => {
      state.isOpen = false;
      state.selectedPostId = null;
    },
  },
});

export const { openPostModal, closePostModal } = viewPostModalSlice.actions;

export default viewPostModalSlice.reducer;
