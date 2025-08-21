import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";

import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const authorization = (await headers()).get("authorization");

    if (!authorization) {
      return new Response("Missing authorization header", { status: 400 });
    }

    const event = await receiver.receive(body, authorization);

    const ingressId = event.ingressInfo?.ingressId;

    if (!ingressId) {
      return new Response("Missing ingressId", { status: 400 });
    }

    if (event.event === "ingress_started") {
      await db.stream.update({
        where: { ingressId },
        data: { isLive: true },
      });
    } else if (event.event === "ingress_ended") {
      await db.stream.update({
        where: { ingressId },
        data: { isLive: false },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook handler error", { status: 500 });
  }
}