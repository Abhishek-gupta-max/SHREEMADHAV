import { EmployerModel } from '../models/employer.model.js';
import { created } from '../utils/response.js';
import { clientIp } from '../utils/request.js';

const RECEIVED = 'Thank you. Your employer enquiry has been received. Our team will contact you shortly.';

export async function create(req, res) {
  const { website, ...input } = req.body;
  if (!website) await EmployerModel.create({ ...input, submittedIp: clientIp(req) });
  return created(res, null, { message: RECEIVED });
}
