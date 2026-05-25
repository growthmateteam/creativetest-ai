import { AdSettings, defaultAdSettings } from "./template-defaults";

export type FileStatus = "uploading" | "ready" | "failed";

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: "image" | "video";
  mime: string;
  storagePath: string;
  previewUrl?: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

export type LaunchAdStatus = "pending" | "uploading" | "success" | "failed";

export interface LaunchAdProgress {
  fileId: string;
  name: string;
  adset: string;
  status: LaunchAdStatus;
  error?: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "Account & campaign",
  2: "Upload creatives",
  3: "Assign to adsets",
  4: "Ad settings",
  5: "Review",
  6: "Launch",
};

export const MAX_FILES = 50;
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];

export interface UploadWizardState {
  sessionId: string | null;
  step: WizardStep;
  accountId: string;
  campaignName: string;
  adsets: string[]; // adset names for this session
  templateId: string | null;
  files: UploadFile[];
  // fileId -> adset name
  assignments: Record<string, string>;
  settings: AdSettings;
}

export const emptyWizardState: UploadWizardState = {
  sessionId: null,
  step: 1,
  accountId: "",
  campaignName: "",
  adsets: [],
  templateId: null,
  files: [],
  assignments: {},
  settings: defaultAdSettings,
};
