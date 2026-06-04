export type UploadResumeState = {
  message: string;
  status: "idle" | "success" | "error";
  warning?: string;
};

export type DeleteResumeState = UploadResumeState;

export const initialUploadResumeState: UploadResumeState = {
  message: "",
  status: "idle",
};

export const initialDeleteResumeState: DeleteResumeState = {
  message: "",
  status: "idle",
};
