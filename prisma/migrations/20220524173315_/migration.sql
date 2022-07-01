-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "tags" JSONB NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
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
    "description" TEXT,
    "config" JSONB NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "groups_id" JSONB NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

create TABLE "channel_config" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "channel_number" VARCHAR(50) NOT NULL,
    "menus" JSONB NOT NULL,
    "messages" JSONB NOT NULL,
    "quizes" JSONB NOT NULL,
    "redirects" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "created_by" VARCHAR(120) NOT NULL,
    "updated_by" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "channel_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pointer_conversation" (
    "id" SERIAL NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "pointer" VARCHAR(120) NULL,
    "config" JSONB,
    "status" SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT "pointer_coversation_pkey" PRIMARY KEY ("id")
);
