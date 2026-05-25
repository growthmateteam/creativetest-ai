export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export const NOTIFICATION_EVENTS = [
  { type: "upload_complete", label: "Upload Complete", emailSupported: true },
  { type: "upload_failure", label: "Upload Failure", emailSupported: true },
  { type: "fb_token_expiring", label: "Facebook Token Expiring", emailSupported: true },
  { type: "rate_limit_warning", label: "Rate Limit Warning", emailSupported: false },
] as const;

export type NotificationEventType = typeof NOTIFICATION_EVENTS[number]["type"];
