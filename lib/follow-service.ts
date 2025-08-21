import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth_service";

export const getFollowedUsers = async () => {
  try {
    const self = await getSelf();

    const followedUsers = await db.follow.findMany({
      where: {
        followerId: self.id,
        following: {
          OR: [
            {
              blocking: {
                none: {
                  blockingId: self.id,
                },
              },
            },
            {
              blockedBy: {
                none: {
                  blockedById: self.id,
                },
              },
            },
          ],
        },
      },
      include: {
        following: {
          include: {
            Stream: {
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    // ✅ Flatten Stream[] → Stream | null
    const result = followedUsers.map((follow) => ({
      ...follow,
      following: {
        ...follow.following,
        Stream: follow.following.Stream[0] ?? null,
      },
    }));

    return result;
  } catch {
    return [];
  }
};

export const isFollowingUser = async (id: string) => {
  try {
    const self = await getSelf();

    const otheruser = await db.user.findUnique({
      where: { id },
    });

    if (!otheruser) {
      throw new Error("User not found");
    }

    if (otheruser.id === self.id) {
      return true;
    }

    const existingFollow = await db.follow.findFirst({
      where: {
        followerId: self.id,
        followingId: otheruser.id,
      },
    });

    return !!existingFollow;
  } catch {
    return false;
  }
};

export const followUser = async (id: string) => {
  const self = await getSelf();

  const otherUser = await db.user.findUnique({
    where: { id },
  });

  if (!otherUser) {
    throw new Error("User not found");
  }

  if (otherUser.id === self.id) {
    throw new Error("Cannot follow yourself");
  }

  const existingFollow = await db.follow.findFirst({
    where: {
      followerId: self.id,
      followingId: otherUser.id,
    },
  });

  if (existingFollow) {
    throw new Error("Already Following");
  }

  const follow = await db.follow.create({
    data: {
      followerId: self.id,
      followingId: otherUser.id,
    },
    include: {
      following: true,
      follower: true,
    },
  });

  return follow;
};

export const unfollowUser = async (id: string) => {
  const self = await getSelf();

  const otherUser = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (!otherUser) {
    throw new Error("User not found");
  }

  if (otherUser.id === self.id) {
    throw new Error("Cannot unfollow yourself");
  }

  const existingFollow = await db.follow.findFirst({
    where: {
      followerId: self.id,
      followingId: otherUser.id,
    },
  });

  if (!existingFollow) {
    throw new Error("Not following");
  }

  const follow = await db.follow.delete({
    where: {
      id: existingFollow.id,
    },
    include: {
      following: true,
    },
  });

  return follow;
};