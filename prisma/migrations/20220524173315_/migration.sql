-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);
