import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;
type RedisEnv ={
    url:string,
    token:string
}

export async function upstashRatelimit(tokens: number, duration: Duration, {url,token}:RedisEnv,IP?:string) {
  const redis = new Redis({
    url,
    token
  });
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, duration),
  });
  const ip = headers().get("x-forwarded-for");
  const {
    remaining,
    limit,
    success: limitReached,
  } = await ratelimit.limit(IP ? IP! : ip!);

  return { limit, limitReached, remaining };
}
