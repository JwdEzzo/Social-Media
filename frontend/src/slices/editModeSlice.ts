import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface EditModeState {
  isEditing: boolean;
  commendId: number | null;
}

const EditModeInitialState: EditModeState = {
  isEditing: false,
  commendId: null,
};

export const editModeSlice = createSlice({
  name: "editMode",
  initialState: EditModeInitialState,
  reducers: {
    openEditMode: (state, action: PayloadAction<number>) => {
      state.isEditing = true;
      state.commendId = action.payload;
    },
    closeEditMode: (state) => {
      state.isEditing = false;
      state.commendId = null;
    },
  },
});

export const { openEditMode, closeEditMode } = editModeSlice.actions;

export default editModeSlice.reducer;
