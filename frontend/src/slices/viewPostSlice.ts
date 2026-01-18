import { createSlice } from "@reduxjs/toolkit";

interface ViewPostModalState {
  isOpen: boolean;
  selectedPostId: number | null;
  previousScrollPosition: number | null;
}

const ViewPostModalInitialState: ViewPostModalState = {
  isOpen: false,
  selectedPostId: null,
  previousScrollPosition: null,
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
      state.previousScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      state.isOpen = false;
      state.selectedPostId = null;
    },
    restoreModalWithScroll: (state, action) => {
      state.isOpen = true;
      state.selectedPostId = action.payload;
    },
    clearScrollPosition: (state) => {
      state.previousScrollPosition = null;
    },
  },
});

export const {
  openPostModal,
  closePostModal,
  restoreModalWithScroll,
  clearScrollPosition,
} = viewPostModalSlice.actions;

export default viewPostModalSlice.reducer;
