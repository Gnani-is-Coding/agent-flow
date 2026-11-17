-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
