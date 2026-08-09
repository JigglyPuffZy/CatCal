import { DEFAULT_FEEDING_SCHEDULE } from "./feedingSchedule.js";
import { prisma } from "./prisma.js";

export async function ensureUserDefaults(
  userId: string,
  fullNameForCreate?: string
) {
  const fullName = fullNameForCreate?.trim();

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: fullName || "CatCal User",
    },
    update: fullName ? { fullName } : {},
  });

  await prisma.notificationSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const scheduleCount = await prisma.feedingSchedule.count({ where: { userId } });
  if (scheduleCount === 0) {
    await prisma.feedingSchedule.createMany({
      data: DEFAULT_FEEDING_SCHEDULE.map((item, index) => ({
        userId,
        label: item.label,
        time: item.time,
        sortOrder: index,
      })),
    });
  }
}

export async function getUserFeedingSchedules(userId: string) {
  return prisma.feedingSchedule.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, notificationSettings: true },
  });
}
