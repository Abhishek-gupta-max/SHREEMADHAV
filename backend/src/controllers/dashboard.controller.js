import { APPLICATION_STATUSES } from '../config/constants.js';
import { ApplicationModel } from '../models/application.model.js';
import { EnquiryModel } from '../models/enquiry.model.js';
import { ActivityModel } from '../models/activity.model.js';
import { ok } from '../utils/response.js';

const TREND_DAYS = 30;

export async function summary(_req, res) {
  const [statusCounts, lastSevenDays, daily, topCountries, topSectors, recent, enquiryCounts, activity] =
    await Promise.all([
      ApplicationModel.countByStatus(),
      ApplicationModel.countSince(7),
      ApplicationModel.dailyCounts(TREND_DAYS),
      ApplicationModel.topValues('preferred_country'),
      ApplicationModel.topValues('preferred_sector'),
      ApplicationModel.recent(6),
      EnquiryModel.countByStatus(),
      ActivityModel.recent(8),
    ]);

  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, statusCounts[status] || 0]));
  const total = Object.values(byStatus).reduce((sum, value) => sum + value, 0);

  // One point per day, with zero for days that had no applications.
  const dailyMap = new Map(daily.map((row) => [row.day, row.total]));
  const trend = Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (TREND_DAYS - 1 - index));
    const day = date.toISOString().slice(0, 10);
    return { day, total: dailyMap.get(day) || 0 };
  });

  return ok(res, {
    applications: {
      total,
      lastSevenDays,
      byStatus,
      // "Pending" = received but not yet decided; "reviewed" = progressed past screening.
      pending: byStatus.new + byStatus.under_review,
      reviewed: byStatus.shortlisted + byStatus.interview,
    },
    enquiries: {
      total: Object.values(enquiryCounts).reduce((sum, value) => sum + value, 0),
      new: enquiryCounts.new || 0,
      inProgress: enquiryCounts.in_progress || 0,
    },
    trend,
    topCountries,
    topSectors,
    recentApplications: recent,
    recentActivity: activity,
  });
}
