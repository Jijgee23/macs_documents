-- AlterTable
ALTER TABLE "Settings"
  ADD COLUMN "systemPrompt" TEXT,
  ADD COLUMN "rules" TEXT,
  ADD COLUMN "unavailableMessage" TEXT,
  ADD COLUMN "errorMessage" TEXT;
