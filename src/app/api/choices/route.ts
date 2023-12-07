import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { choicesTable } from "@/db/schema"; 

const choiceRequestSchema = z.object({
  tweetId: z.number().positive(),
  userHandle: z.string().min(1).max(50),
  date: z.number(), // 日期
  hour: z.number(), // 小時
});

type ChoiceRequest = z.infer<typeof choiceRequestSchema>;

export async function GET(request: NextRequest) {
  const data = await request.json();

  try {
    choiceRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, date, hour } = data as ChoiceRequest;

  try {
    const [exist] = await db
      .select({ dummy: sql`1` })
      .from(choicesTable)
      .where(
        and(
          eq(choicesTable.tweetId, tweetId),
          eq(choicesTable.userHandle, userHandle),
          eq(choicesTable.date, date),
          eq(choicesTable.hour, hour),
        ),
      )
      .execute();

    return NextResponse.json({ chosen: Boolean(exist) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    choiceRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, date, hour } = data as ChoiceRequest;

  try {
    await db
      .insert(choicesTable)
      .values({
        tweetId,
        userHandle,
        date,
        hour,
      })
      .onConflictDoNothing() 
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    choiceRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tweetId, userHandle, date, hour } = data as ChoiceRequest;

  try {
    await db
      .delete(choicesTable)
      .where(
        and(
          eq(choicesTable.tweetId, tweetId),
          eq(choicesTable.userHandle, userHandle),
          eq(choicesTable.date, date),
          eq(choicesTable.hour, hour),
        ),
      )
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}
