import "server-only";

import prisma from "@/lib/prisma";
import { getDownloadUrls } from "@/lib/s3/get-download-url";
import { requireAdmin } from "./require-admin";

const DAYS = 30;

export type tAnalyticsSparkPoint = {
  date: string;
  value: number;
};

export type tAnalyticsDailyPoint = {
  date: string;
  enrollments: number;
  revenue: number;
};

export type tAnalyticsRecentCourse = {
  id: string;
  title: string;
  smallDesc: string;
  imageUrl: string | null;
  price: number;
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: Date;
};

export type tAnalyticsStats = {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  activeEnrollments: number;
  pendingEnrollments: number;
  contactMessages: number;
  totalRevenueCents: number;
  newUsersThisPeriod: number;
  newCoursesThisPeriod: number;
  newEnrollmentsThisPeriod: number;
  newRevenueCentsThisPeriod: number;
};

export type tAnalytics = {
  stats: tAnalyticsStats;
  sparklines: {
    users: tAnalyticsSparkPoint[];
    courses: tAnalyticsSparkPoint[];
    enrollments: tAnalyticsSparkPoint[];
    revenue: tAnalyticsSparkPoint[];
  };
  enrollmentTrend: tAnalyticsDailyPoint[];
  recentCourses: tAnalyticsRecentCourse[];
};

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildEmptyBuckets(days: number): Map<string, number> {
  const buckets = new Map<string, number>();
  const today = startOfDayUTC(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - i);
    buckets.set(isoDay(day), 0);
  }
  return buckets;
}

export async function adminGetAnalytics(): Promise<tAnalytics> {
  await requireAdmin();

  const today = startOfDayUTC(new Date());
  const startDate = new Date(today);
  startDate.setUTCDate(today.getUTCDate() - (DAYS - 1));

  const [
    totalUsers,
    totalCourses,
    publishedCourses,
    activeEnrollments,
    pendingEnrollments,
    contactMessages,
    revenueAggregate,
    recentUsers,
    recentCoursesAll,
    recentEnrollments,
    recentCourses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count({ where: { status: "Active" } }),
    prisma.enrollment.count({ where: { status: "Pending" } }),
    prisma.contactMessage.count(),
    prisma.enrollment.aggregate({
      _sum: { amount: true },
      where: { status: "Active" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.course.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, amount: true, status: true },
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        smallDesc: true,
        fileKey: true,
        price: true,
        duration: true,
        level: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const userBuckets = buildEmptyBuckets(DAYS);
  for (const u of recentUsers) {
    const key = isoDay(startOfDayUTC(u.createdAt));
    userBuckets.set(key, (userBuckets.get(key) ?? 0) + 1);
  }

  const courseBuckets = buildEmptyBuckets(DAYS);
  for (const c of recentCoursesAll) {
    const key = isoDay(startOfDayUTC(c.createdAt));
    courseBuckets.set(key, (courseBuckets.get(key) ?? 0) + 1);
  }

  const enrollmentBuckets = buildEmptyBuckets(DAYS);
  const revenueBuckets = buildEmptyBuckets(DAYS);
  const trendBuckets = new Map<string, tAnalyticsDailyPoint>();

  for (let i = DAYS - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - i);
    trendBuckets.set(isoDay(day), {
      date: isoDay(day),
      enrollments: 0,
      revenue: 0,
    });
  }

  for (const e of recentEnrollments) {
    const key = isoDay(startOfDayUTC(e.createdAt));
    enrollmentBuckets.set(key, (enrollmentBuckets.get(key) ?? 0) + 1);
    if (e.status === "Active") {
      revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + e.amount);
    }
    const trendPoint = trendBuckets.get(key);
    if (trendPoint) {
      trendPoint.enrollments += 1;
      if (e.status === "Active") {
        trendPoint.revenue += e.amount;
      }
    }
  }

  const totalRevenueCents = revenueAggregate._sum.amount ?? 0;
  const newRevenueCentsThisPeriod = Array.from(revenueBuckets.values()).reduce(
    (acc, v) => acc + v,
    0,
  );

  const sparkPointsFromBuckets = (buckets: Map<string, number>): tAnalyticsSparkPoint[] =>
    Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));

  const recentImageUrls = await getDownloadUrls(
    recentCourses.map((c) => c.fileKey),
  );

  return {
    stats: {
      totalUsers,
      totalCourses,
      publishedCourses,
      activeEnrollments,
      pendingEnrollments,
      contactMessages,
      totalRevenueCents,
      newUsersThisPeriod: recentUsers.length,
      newCoursesThisPeriod: recentCoursesAll.length,
      newEnrollmentsThisPeriod: recentEnrollments.length,
      newRevenueCentsThisPeriod,
    },
    sparklines: {
      users: sparkPointsFromBuckets(userBuckets),
      courses: sparkPointsFromBuckets(courseBuckets),
      enrollments: sparkPointsFromBuckets(enrollmentBuckets),
      revenue: sparkPointsFromBuckets(revenueBuckets),
    },
    enrollmentTrend: Array.from(trendBuckets.values()),
    recentCourses: recentCourses.map((c, i) => ({
      id: c.id,
      title: c.title,
      smallDesc: c.smallDesc,
      imageUrl: recentImageUrls[i],
      price: c.price,
      duration: c.duration,
      level: c.level,
      slug: c.slug,
      status: c.status,
      createdAt: c.createdAt,
    })),
  };
}
