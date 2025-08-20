"use server";

import { getSelf } from "@/lib/auth_service";
import { blockUser, unblockUser } from "@/lib/block-service";

import { revalidatePath } from "next/cache";


export const onBlock = async (id: string) => {
  try {
    // Adapt to disconnect from LiveStream
    const self = await getSelf();

    let blockedUser;

    // Allow ability to kick the guest
    try {
      blockedUser = await blockUser(id);
    } catch {
      // This means user is a guest!
    }

    revalidatePath(`/u/${self.username}/community`);

    if (!blockedUser) {
      throw new Error(`blockUser function failed!`);
    }

    revalidatePath(`/${blockedUser.blocked.username}`);
    revalidatePath("/");
    return blockedUser;
  } catch (error: any) {
    console.error(`[onBlock Error]: ${error}`);
    throw new Error(error.message);
  }
};

export const onUnblock = async (id: string) => {
  try {
    const self = await getSelf();

    const unblockedUser = await unblockUser(id);

    // if (unblockedUser) {
    //   revalidatePath(`/${unblockedUser.blocking.username}`);
    // }

    revalidatePath(`/u/${self.username}/community`);

    return unblockedUser;
  } catch (error: any) {
    console.error(`[onUnblock Error]: ${error}`);
    throw new Error(error.message);
  }
};