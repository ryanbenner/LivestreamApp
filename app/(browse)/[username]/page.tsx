import { StreamPlayer } from "@/components/stream-player";
import { isBlockedByUser } from "@/lib/block-service";
import { isFollowingUser } from "@/lib/follow-service";
import { getUserByUsername } from "@/lib/user-service";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface DashboardPageProps {
  params: {
    username: string;
  };
}

export default async function DashboardPage({ 
    params 
}: DashboardPageProps) {
  const externalUser = await currentUser();
  const user = await getUserByUsername(params.username);
  const stream = user?.Stream?.[0] ?? null;

  if (!user || !stream) {
    notFound();
  }

  const isFollowing = await isFollowingUser(user.id);
  const isBlocked = await isBlockedByUser(user.id);

  if (isBlocked) {
    notFound();
  }

  return (
    <div className="h-full">
      <StreamPlayer
        user={{ ...user, stream }} // adds `.stream` key to user object
        stream={stream}
        isFollowing={isFollowing}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";