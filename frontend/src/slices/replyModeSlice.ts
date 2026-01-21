import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ReplyModeState {
  isReplying: boolean;
  commentId: number | null;
  username: string | null;
}

const ReplyModeInitialState: ReplyModeState = {
  isReplying: false,
  commentId: null,
  username: null,
};

export const replyModeSlice = createSlice({
  name: "replyMode",
  initialState: ReplyModeInitialState,
  reducers: {
    openReplyMode: (state, action: PayloadAction<number>) => {
      state.isReplying = true;
      state.commentId = action.payload;
    },
    closeReplyMode: (state) => {
      state.isReplying = false;
      state.commentId = null;
    },
  },
});

export const { openReplyMode, closeReplyMode } = replyModeSlice.actions;

export default replyModeSlice.reducer;
