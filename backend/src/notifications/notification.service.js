export const sendNotification = (userId, type, message) => {
  const trimmedUserId = typeof userId === "string" ? userId.trim() : "";
  const recipient = trimmedUserId.length > 0 ? trimmedUserId : "unknown";
  console.log(
    `[notification] to=${recipient} type=${type} message=${message}`,
  );
};
