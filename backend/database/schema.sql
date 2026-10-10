-- ---------------------------------------------------------------------------
-- ShreeMadhav Overseas Solutions Private Limited — database schema
-- Compatible with MySQL 8.0+ and MariaDB 10.4+.
--
-- Applied by `npm run db:migrate`, which creates DB_NAME if needed.
-- Every statement is idempotent, so re-running is safe.
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;

-- Back-office user accounts ----------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(190)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('super_admin','admin','viewer') NOT NULL DEFAULT 'admin',
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  token_version   INT UNSIGNED  NOT NULL DEFAULT 0,
  last_login_at   DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services shown on the public website (managed in admin) -----------------------
CREATE TABLE IF NOT EXISTS services (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(120)  NOT NULL,
  icon            VARCHAR(40)   NOT NULL DEFAULT 'compass',
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  is_featured     TINYINT(1)    NOT NULL DEFAULT 0,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_slug (slug),
  KEY idx_services_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Localised copy for each service (one row per language) -----------------------
CREATE TABLE IF NOT EXISTS service_translations (
  service_id      INT UNSIGNED  NOT NULL,
  locale          VARCHAR(5)    NOT NULL,
  title           VARCHAR(150)  NOT NULL,
  summary         VARCHAR(400)  NOT NULL,
  body            TEXT          NULL,
  PRIMARY KEY (service_id, locale),
  CONSTRAINT fk_service_translations_service
    FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Published job openings for the Careers page -----------------------------------
CREATE TABLE IF NOT EXISTS job_openings (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title            VARCHAR(160) NOT NULL,
  slug             VARCHAR(180) NOT NULL,
  country          VARCHAR(100) NULL,
  location         VARCHAR(150) NULL,
  sector           VARCHAR(100) NULL,
  employment_type  ENUM('full_time','part_time','contract','temporary','internship') NOT NULL DEFAULT 'full_time',
  summary          TEXT         NOT NULL,
  requirements     TEXT         NULL,
  status           ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  published_at     DATETIME     NULL,
  created_by       INT UNSIGNED NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jobs_slug (slug),
  KEY idx_jobs_status_published (status, published_at),
  CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate applications -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference_no           VARCHAR(20)     NOT NULL,
  job_id                 INT UNSIGNED    NULL,

  full_name              VARCHAR(150)    NOT NULL,
  email                  VARCHAR(190)    NOT NULL,
  phone                  VARCHAR(25)     NOT NULL,
  date_of_birth          DATE            NOT NULL,
  gender                 ENUM('male','female','other','prefer_not_to_say') NOT NULL,

  city                   VARCHAR(100)    NOT NULL,
  state                  VARCHAR(100)    NOT NULL,
  country                VARCHAR(100)    NOT NULL,

  qualification          VARCHAR(40)     NOT NULL,
  experience             VARCHAR(20)     NOT NULL,
  profession             VARCHAR(150)    NOT NULL,
  preferred_opportunity  VARCHAR(40)     NOT NULL,

  preferred_country      VARCHAR(100)    NOT NULL,
  preferred_sector       VARCHAR(60)     NOT NULL,
  preferred_position     VARCHAR(150)    NOT NULL,

  message                TEXT            NULL,
  consent_at             DATETIME        NOT NULL,
  language               VARCHAR(5)      NOT NULL DEFAULT 'en',

  status                 ENUM('new','under_review','shortlisted','interview','selected','rejected','closed')
                         NOT NULL DEFAULT 'new',
  status_changed_at      DATETIME        NULL,

  submitted_ip           VARCHAR(45)     NULL,
  created_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_applications_reference (reference_no),
  KEY idx_applications_status_created (status, created_at),
  KEY idx_applications_created (created_at),
  KEY idx_applications_email (email),
  KEY idx_applications_name (full_name),
  KEY idx_applications_pref_country (preferred_country),
  KEY idx_applications_pref_sector (preferred_sector),
  KEY idx_applications_job (job_id),
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_openings (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files uploaded with an application (stored outside the web root) ------------------
CREATE TABLE IF NOT EXISTS application_documents (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id   BIGINT UNSIGNED NOT NULL,
  doc_type         ENUM('cv','supporting') NOT NULL,
  original_name    VARCHAR(255)    NOT NULL,
  stored_name      VARCHAR(100)    NOT NULL,
  mime_type        VARCHAR(100)    NOT NULL,
  size_bytes       INT UNSIGNED    NOT NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_documents_stored_name (stored_name),
  KEY idx_documents_application (application_id),
  KEY idx_documents_created (created_at),
  CONSTRAINT fk_documents_application
    FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Internal staff notes on an application ---------------------------------------------
CREATE TABLE IF NOT EXISTS admin_notes (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id   BIGINT UNSIGNED NOT NULL,
  admin_id         INT UNSIGNED    NULL,
  body             TEXT            NOT NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notes_application (application_id, created_at),
  CONSTRAINT fk_notes_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages from the contact page -------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name        VARCHAR(150)    NOT NULL,
  email            VARCHAR(190)    NOT NULL,
  phone            VARCHAR(25)     NULL,
  enquiry_type     ENUM('general','education','opportunities','employer','application') NOT NULL DEFAULT 'general',
  subject          VARCHAR(200)    NOT NULL,
  message          TEXT            NOT NULL,
  status           ENUM('new','in_progress','resolved','archived') NOT NULL DEFAULT 'new',
  submitted_ip     VARCHAR(45)     NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_enquiries_status_created (status, created_at),
  KEY idx_enquiries_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Key/value website settings (contact details, social links) -------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key      VARCHAR(60)     NOT NULL,
  setting_value    VARCHAR(500)    NULL,
  updated_by       INT UNSIGNED    NULL,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key),
  CONSTRAINT fk_settings_admin FOREIGN KEY (updated_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit trail ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id         INT UNSIGNED    NULL,
  entity_type      ENUM('application','enquiry','job','service','settings','admin','auth') NOT NULL,
  entity_id        BIGINT UNSIGNED NULL,
  action           VARCHAR(60)     NOT NULL,
  details          TEXT            NULL,
  ip_address       VARCHAR(45)     NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_entity (entity_type, entity_id, created_at),
  KEY idx_activity_admin (admin_id),
  KEY idx_activity_created (created_at),
  CONSTRAINT fk_activity_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Per-year sequence for SMOS-YYYY-NNNNN application IDs ---------------------------------------
CREATE TABLE IF NOT EXISTS reference_counters (
  year             SMALLINT UNSIGNED NOT NULL,
  last_value       INT UNSIGNED      NOT NULL DEFAULT 0,
  PRIMARY KEY (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
