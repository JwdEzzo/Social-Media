import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface EditModeState {
  isEditing: boolean;
  commentId: number | null;
  replyId: number | null;
  editType: "comment" | "reply" | null;
}

const EditModeInitialState: EditModeState = {
  isEditing: false,
  commentId: null,
  replyId: null,
  editType: null,
};

export const editModeSlice = createSlice({
  name: "editMode",
  initialState: EditModeInitialState,
  reducers: {
    enterEditCommentMode: (state, action: PayloadAction<number>) => {
      state.isEditing = true;
      state.commentId = action.payload;
      state.replyId = null;
      state.editType = "comment";
    },
    enterEditReplyMode: (state, action: PayloadAction<number>) => {
      state.isEditing = true;
      state.commentId = null;
      state.replyId = action.payload;
      state.editType = "reply";
    },
    closeEditMode: (state) => {
      state.isEditing = false;
      state.commentId = null;
      state.replyId = null;
      state.editType = null;
    },
  },
});

export const {
  enterEditCommentMode,
  closeEditMode,
  enterEditReplyMode,
  //
} = editModeSlice.actions;

export default editModeSlice.reducer;
