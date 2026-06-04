export type UploadResumeState = {
  message: string;
  status: "idle" | "success" | "error";
};

export const initialUploadResumeState: UploadResumeState = {
  message: "",
  status: "idle",
};
