import { Router } from 'express';
import * as dashboard from '../controllers/dashboard.controller.js';
import * as applications from '../controllers/application.controller.js';
import * as enquiries from '../controllers/contact.controller.js';
import * as services from '../controllers/service.controller.js';
import * as jobs from '../controllers/job.controller.js';
import * as settings from '../controllers/settings.controller.js';
import * as team from '../controllers/team.controller.js';
import { canEdit, requireAuth, superAdminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import {
  createNoteSchema,
  documentParams,
  listApplicationsQuery,
  listDocumentsQuery,
  updateApplicationSchema,
} from '../validators/application.validator.js';
import { listEnquiriesQuery, updateEnquirySchema } from '../validators/contact.validator.js';
import { jobSchema, listJobsQuery, serviceSchema, settingsSchema } from '../validators/content.validator.js';
import { createAdminSchema, updateAdminSchema } from '../validators/auth.validator.js';

// Back office. Every route requires a signed-in administrator; routes that
// change data additionally require an editing role.
const router = Router();
router.use(requireAuth);

const byId = validate(idParam, 'params');

router.get('/dashboard', dashboard.summary);

// Applications
router.get('/applications', validate(listApplicationsQuery, 'query'), applications.list);
router.get('/applications/filters', applications.filterOptions);
router.get('/applications/:id', byId, applications.show);
router.patch('/applications/:id', canEdit, byId, validate(updateApplicationSchema), applications.update);
router.delete('/applications/:id', superAdminOnly, byId, applications.remove);
router.post('/applications/:id/notes', canEdit, byId, validate(createNoteSchema), applications.addNote);
router.get(
  '/applications/:id/documents/:documentId',
  validate(documentParams, 'params'),
  applications.downloadDocument,
);
router.get('/documents', validate(listDocumentsQuery, 'query'), applications.listDocuments);

// Contact enquiries
router.get('/enquiries', validate(listEnquiriesQuery, 'query'), enquiries.list);
router.get('/enquiries/:id', byId, enquiries.show);
router.patch('/enquiries/:id', canEdit, byId, validate(updateEnquirySchema), enquiries.update);
router.delete('/enquiries/:id', canEdit, byId, enquiries.remove);

// Website content
router.get('/services', services.list);
router.get('/services/:id', byId, services.show);
router.post('/services', canEdit, validate(serviceSchema), services.create);
router.put('/services/:id', canEdit, byId, validate(serviceSchema), services.update);
router.delete('/services/:id', canEdit, byId, services.remove);

router.get('/jobs', validate(listJobsQuery, 'query'), jobs.list);
router.get('/jobs/:id', byId, jobs.show);
router.post('/jobs', canEdit, validate(jobSchema), jobs.create);
router.put('/jobs/:id', canEdit, byId, validate(jobSchema), jobs.update);
router.delete('/jobs/:id', canEdit, byId, jobs.remove);

router.get('/settings', settings.show);
router.put('/settings', canEdit, validate(settingsSchema), settings.update);

// Team accounts
router.get('/team', superAdminOnly, team.list);
router.post('/team', superAdminOnly, validate(createAdminSchema), team.create);
router.patch('/team/:id', superAdminOnly, byId, validate(updateAdminSchema), team.update);

export default router;
