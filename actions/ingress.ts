"use server";

import {
  IngressInput,
  IngressClient,
  RoomServiceClient,
  type CreateIngressOptions, IngressAudioOptions, IngressVideoOptions,
  EncodingOptions,
  IngressVideoEncodingPreset,
  IngressAudioEncodingPreset,
} from "livekit-server-sdk";

import { TrackSource } from "livekit-server-sdk";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth_service";
import { revalidatePath } from "next/cache";


const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

const ingressClient = new IngressClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export const resetIngresses = async (hostIdentity: string) => {
  const ingresses = await ingressClient.listIngress({ roomName: hostIdentity });
  const rooms = await roomService.listRooms([hostIdentity]);

  for (const room of rooms) {
    await roomService.deleteRoom(room.name);
  }

  for (const ingress of ingresses) {
    if (ingress.ingressId) {
      await ingressClient.deleteIngress(ingress.ingressId);
    }
  }
};

export const createIngress = async (ingressType: IngressInput) => {
  const self = await getSelf();
  await resetIngresses(self.id);

  const options: CreateIngressOptions = {
    name: self.username,
    roomName: self.id,
    participantName: self.username,
    participantIdentity: self.id,
  };

  if (ingressType === IngressInput.RTMP_INPUT) {
    const video = new IngressVideoOptions({
        name: "video",
        source: TrackSource.CAMERA,
        encodingOptions: {
          case: "preset",
          value: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
        },
      });
      
      const audio = new IngressAudioOptions({
        name: "audio",
        source: TrackSource.MICROPHONE,
        encodingOptions: {
          case: "preset",
          value: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
        },
      });

    options.video = video;
    options.audio = audio;
  } else {
    options.enableTranscoding = true;
  }

  const ingress = await ingressClient.createIngress(ingressType, options);

  if (!ingress || !ingress.url || !ingress.streamKey) {
    throw new Error("Failed to create ingress");
  }

  await db.stream.update({
    where: { userId: self.id },
    data: {
      ingressId: ingress.ingressId,
      serverUrl: ingress.url,
      streamKey: ingress.streamKey,
    },
  });

  revalidatePath(`/u/${self.username}/keys`);
  return ingress;
};