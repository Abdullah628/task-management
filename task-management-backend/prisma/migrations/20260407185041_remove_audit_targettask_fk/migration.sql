-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_targetTaskId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "targetTaskId" DROP NOT NULL;
