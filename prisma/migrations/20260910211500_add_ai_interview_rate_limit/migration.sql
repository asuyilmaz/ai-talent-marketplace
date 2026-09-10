-- CreateTable
CREATE TABLE "AiInterviewRateLimit" (
    "candidateId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInterviewRateLimit_pkey" PRIMARY KEY ("candidateId")
);

-- CreateIndex
CREATE INDEX "AiInterviewRateLimit_windowStart_idx" ON "AiInterviewRateLimit"("windowStart");

-- AddForeignKey
ALTER TABLE "AiInterviewRateLimit" ADD CONSTRAINT "AiInterviewRateLimit_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
