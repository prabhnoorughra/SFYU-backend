-- CreateTable
CREATE TABLE "public"."PageViewCounter" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageViewCounter_pkey" PRIMARY KEY ("key")
);
