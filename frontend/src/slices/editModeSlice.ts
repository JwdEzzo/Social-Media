import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface EditModeState {
  isEditing: boolean;
  commentId: number | null;
}

const EditModeInitialState: EditModeState = {
  isEditing: false,
  commentId: null,
};

export const editModeSlice = createSlice({
  name: "editMode",
  initialState: EditModeInitialState,
  reducers: {
    enterEditMode: (state, action: PayloadAction<number>) => {
      state.isEditing = true;
      state.commentId = action.payload;
    },
    closeEditMode: (state) => {
      state.isEditing = false;
      state.commentId = null;
    },
  },
});

export const { enterEditMode, closeEditMode } = editModeSlice.actions;

export default editModeSlice.reducer;
