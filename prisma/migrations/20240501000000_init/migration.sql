-- CreateTable
CREATE TABLE "salary_submission" (
    "id" TEXT NOT NULL,
    "company_normalized" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level_standardized" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experience_years" DOUBLE PRECISION NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_compensation" DOUBLE PRECISION NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "confidence_breakdown" JSONB,
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "dedupe_hash" TEXT NOT NULL,
    "run_id" TEXT,
    "needs_human_review" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_run" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metrics" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "ingestion_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rejection_log" (
    "id" TEXT NOT NULL,
    "run_id" TEXT,
    "stage" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rejection_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicate_log" (
    "id" TEXT NOT NULL,
    "run_id" TEXT,
    "dedupe_hash" TEXT NOT NULL,
    "matched_submission_id" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duplicate_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "human_review_queue" (
    "id" TEXT NOT NULL,
    "run_id" TEXT,
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "human_review_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salary_submission_dedupe_hash_key" ON "salary_submission"("dedupe_hash");

-- CreateIndex
CREATE INDEX "salary_submission_company_normalized_role_level_standardized_idx" ON "salary_submission"("company_normalized", "role", "level_standardized", "location");

-- CreateIndex
CREATE INDEX "salary_submission_created_at_idx" ON "salary_submission"("created_at");

-- CreateIndex
CREATE INDEX "salary_submission_run_id_idx" ON "salary_submission"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingestion_run_run_id_key" ON "ingestion_run"("run_id");

-- CreateIndex
CREATE INDEX "rejection_log_run_id_idx" ON "rejection_log"("run_id");

-- CreateIndex
CREATE INDEX "duplicate_log_run_id_idx" ON "duplicate_log"("run_id");

-- CreateIndex
CREATE INDEX "human_review_queue_status_idx" ON "human_review_queue"("status");
