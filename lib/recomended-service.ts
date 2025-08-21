import { db } from "./db";
import { getSelf } from "@/lib/auth_service";

export const getRecommended = async () => {
  let userId: string | null = null;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    // not signed in
  }

  const filters = userId
    ? {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              follower: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
          {
            NOT: {
              blocking: {
                some: {
                  blockedById: userId,
                },
              },
            },
          },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where: filters,
    include: {
      Stream: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ✅ Flatten Stream[] → Stream | null
  const result = users.map((user) => ({
    ...user,
    Stream: user.Stream[0] ?? null,
  }));

  return result;
};