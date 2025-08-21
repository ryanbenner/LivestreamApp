import { getUserByUsername } from "@/lib/user-service";
import { currentUser } from "@clerk/nextjs/server";
import { StreamPlayer } from "@/components/stream-player";

interface CreatorPageProps {
  params: {
    username: string;
  };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const externalUser = await currentUser();
  const user = await getUserByUsername(params.username);
  const stream = user?.Stream?.[0] ?? null;

  if (!user || user.externalUserId !== externalUser?.id || !stream) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="h-full">
      <StreamPlayer user={{ ...user, stream }} stream={stream} isFollowing />
    </div>
  );
};

export default CreatorPage;

export const dynamic = "force-dynamic"; // forces correct param evaluation