import { createSlice } from "@reduxjs/toolkit";

interface ViewPostModalState {
  isOpen: boolean;
  selectedPostId: number | null;
  modalScrollPosition: number; // Modal scroll
  homePageScrollPosition: number; // HomePage scroll
}

const ViewPostModalInitialState: ViewPostModalState = {
  isOpen: false,
  selectedPostId: null,
  modalScrollPosition: 0,
  homePageScrollPosition: 0,
};

export const viewPostModalSlice = createSlice({
  name: "viewPostModal",
  initialState: ViewPostModalInitialState,
  reducers: {
    openPostModal: (state, action: { payload: number }) => {
      state.isOpen = true;
      state.selectedPostId = action.payload;
    },
    closePostModal: (state, action) => {
      state.isOpen = false;
      if (!action.payload?.preserveState) {
        state.selectedPostId = null;
        state.modalScrollPosition = 0;
        state.homePageScrollPosition = 0;
      }
    },
    saveModalScrollPosition: (state, action: { payload: number }) => {
      state.modalScrollPosition = action.payload;
    },
    saveHomePageScrollPosition: (state, action: { payload: number }) => {
      state.homePageScrollPosition = action.payload;
    },
  },
});

export const {
  openPostModal,
  closePostModal,
  saveModalScrollPosition,
  saveHomePageScrollPosition,
} = viewPostModalSlice.actions;

export default viewPostModalSlice.reducer;
