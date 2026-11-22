import { Router } from 'express';
import * as applications from '../controllers/application.controller.js';
import * as contact from '../controllers/contact.controller.js';
import * as employer from '../controllers/employer.controller.js';
import * as services from '../controllers/service.controller.js';
import * as jobs from '../controllers/job.controller.js';
import * as settings from '../controllers/settings.controller.js';
import { applicationLimiter, contactLimiter } from '../middleware/rateLimit.js';
import { applicationUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createApplicationSchema } from '../validators/application.validator.js';
import { createEnquirySchema } from '../validators/contact.validator.js';
import { createEmployerEnquirySchema } from '../validators/employer.validator.js';
import { servicesQuery, slugParam } from '../validators/content.validator.js';

// Endpoints used by the public website. No authentication.
const router = Router();

router.post(
  '/applications',
  applicationLimiter,
  applicationUpload, // multipart/form-data: fields + cv + documents[]
  validate(createApplicationSchema),
  applications.create,
);

router.post('/contact', contactLimiter, validate(createEnquirySchema), contact.create);

router.post('/employer-enquiries', contactLimiter, validate(createEmployerEnquirySchema), employer.create);

router.get('/services', validate(servicesQuery, 'query'), services.listPublic);

router.get('/jobs', jobs.listPublished);
router.get('/jobs/:slug', validate(slugParam, 'params'), jobs.showPublished);

router.get('/settings', settings.publicSettings);

export default router;
