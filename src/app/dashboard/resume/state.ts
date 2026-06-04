export type UploadResumeState = {
  message: string;
  status: "idle" | "success" | "error";
  warning?: string;
};

export type DeleteResumeState = UploadResumeState;
export type ReanalyzeResumeState = UploadResumeState;

export const initialUploadResumeState: UploadResumeState = {
  message: "",
  status: "idle",
};

export const initialDeleteResumeState: DeleteResumeState = {
  message: "",
  status: "idle",
};

export const initialReanalyzeResumeState: ReanalyzeResumeState = {
  message: "",
  status: "idle",
};
