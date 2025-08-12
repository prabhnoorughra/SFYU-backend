-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "studentId" CHAR(9) NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailConsent" BOOLEAN NOT NULL,
    "program" VARCHAR(255) NOT NULL,
    "studyYear" VARCHAR(255) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_email_key" ON "public"."Application"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_key" ON "public"."Application"("studentId");
