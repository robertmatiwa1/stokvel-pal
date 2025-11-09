export type NotificationType = string;

export const sendNotification = (
  userId: string,
  type: NotificationType,
  message: string,
): void => {
  const trimmedUserId = userId?.trim();
  const recipient = trimmedUserId && trimmedUserId.length > 0 ? trimmedUserId : "unknown";
  console.log(
    `[notification] to=${recipient} type=${type} message=${message}`,
  );
};
