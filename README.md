# Upstash Rate Limit

A Type safe Utility function  to rate limit requests so user cannot spam your application

 ## Installation

You can install this package via npm or pnpm :

```bash
npm install upstash-rate-limit
# or
pnpm add  upstash-rate-limit

```

## Usage Example With Next js
Before creating database request you can call `upstashRateLimit` function to throw error that you can handle on frontend to show toast notification to avoid spamming. you can also use limit (total limit ) , remaining according to your need. 


```ts filename="action.ts" copy
"use server";

import { db } from "@/server";
import { productSchema } from "@/types/schema";
import { createSafeActionClient } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { products } from "./schema";

import { upstashRatelimit } from "upstash-rate-limit";

const action = createSafeActionClient();

export const createProduct = action(productSchema, async ({ post }) => {
  // @param tokens — How many requests a user can make in each time duration.
  // @param duration — The duration in which the user can max X requests. Bellow is 2 request in 1 sec example.
  // @param object/{url,token} — url and secret token from upstash dashboard(redis database).
  // @param IP? — If you are outside of Next js then must pass IP too.

  const { limit, limitReached, remaining } = await upstashRatelimit(2, "1m", {
    url: process.env.UPSTASH_URL!,
    token: process.env.UPSTASH_TOKEN!,
  });

    if (!limitReached) {
      return { error: "Too many requests" };
    }

    const product = await db.insert(products).values({ post }).returning();

    return { succes: product };

    revalidatePath("/");
  }
);
```
## How to get upstash URL , TOKEN ?
Simple go to the upstash console signup and create new redis database it will generate url and token for you that you can get from connect to database JavaScript Example. Copy it and paste into your .env file if you dont have then create in the root of you project and use it (pass them to UpstashRateLimit function ) . easy peasy . 

## Outside Of Next js ?

If you are outside of Next js then must pass IP too.

```ts filename="actions.ts" copy
  const ip = // use whatever to get IP
  const { limit, limitReached, remaining } = await upstashRatelimit(2, "1m", {
    url: process.env.UPSTASH_URL!,
    token: process.env.UPSTASH_TOKEN!,
  },
   ip
  );

    if (!limitReached) {
      return { error: "Too many requests" };
    }
    // you db call to create product  here
    ....


```


