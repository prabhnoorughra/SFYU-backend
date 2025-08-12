/*
  Warnings:

  - You are about to drop the column `firstname` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `Application` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "firstname",
DROP COLUMN "lastname",
ADD COLUMN     "firstName" VARCHAR(255) NOT NULL,
ADD COLUMN     "fullName" VARCHAR(255) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(255) NOT NULL;
