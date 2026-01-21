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
    enterReplyMode: (
      state,
      action: PayloadAction<{ commentId: number; username: string }>,
    ) => {
      state.isReplying = true;
      state.commentId = action.payload.commentId;
      state.username = action.payload.username;
    },
    closeReplyMode: (state) => {
      state.isReplying = false;
      state.commentId = null;
    },
    resetReplyMode: (state) => {
      state.isReplying = false;
      state.commentId = null;
      state.username = null;
    },
  },
});

export const { enterReplyMode, closeReplyMode, resetReplyMode } =
  replyModeSlice.actions;

export default replyModeSlice.reducer;
