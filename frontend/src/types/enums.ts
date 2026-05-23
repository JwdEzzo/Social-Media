// create an enum for accountstatus public and private
export enum AccountStatus {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum NotificationType {
  POST_LIKE = "POST_LIKE",
  COMMENT_LIKE = "COMMENT_LIKE",
  REPLY_LIKE = "REPLY_LIKE",
  COMMENT = "COMMENT",
  REPLY = "REPLY",
  FOLLOW = "FOLLOW",
  FOLLOW_REQUEST_SENT = "FOLLOW_REQUEST_SENT",
  FOLLOW_REQUEST_ACCEPTED = "FOLLOW_REQUEST_ACCEPTED",
}
