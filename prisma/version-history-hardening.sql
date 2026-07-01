ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "sourceLabel" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "targetLabel" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "contentHash" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "ResumeVersion_resumeId_contentHash_idx"
  ON "ResumeVersion"("resumeId", "contentHash");
