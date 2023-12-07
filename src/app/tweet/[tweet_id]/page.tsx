import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeftCircleIcon } from "lucide-react";

import { not, eq, asc, sql, and } from "drizzle-orm";
import {
  // ArrowLeft,
  // MessageCircle,
  // MoreHorizontal,
  // Repeat2,
  // Share,
} from "lucide-react";

import LikeButton from "@/components/LikeButton";
import ReplyInput from "@/components/ReplyInput";
import TableInput from "@/components/TableInput";
import TimeText from "@/components/TimeText";
// import Tweet from "@/components/Tweet";
import Comment from "@/components/Comment";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { likesTable, tweetsTable, usersTable, choicesTable } from "@/db/schema";
// import { getAvatar } from "@/lib/utils";

type TweetPageProps = {
  params: {
    // this came from the file name: [tweet_id].tsx
    tweet_id: string;
  };
  searchParams: {
    // this came from the query string: ?username=madmaxieee
    username?: string;
    handle?: string;
  };
};

// these two fields are always available in the props object of a page component
export default async function TweetPage({
  params: { tweet_id },
  searchParams: { username, handle },
}: TweetPageProps) {
  // this function redirects to the home page when there is an error
  const errorRedirect = () => {
    const params = new URLSearchParams();
    username && params.set("username", username);
    handle && params.set("handle", handle);
    redirect(`/?${params.toString()}`);
  };

  // if the tweet_id can not be turned into a number, redirect to the home page
  const tweet_id_num = parseInt(tweet_id);
  if (isNaN(tweet_id_num)) {
    errorRedirect();
  }

  // This is the easiest way to get the tweet data
  // you can run separate queries for the tweet data, likes, and liked
  // and then combine them in javascript.
  //
  // This gets things done for now, but it's not the best way to do it
  // relational databases are highly optimized for this kind of thing
  // we should always try to do as much as possible in the database.

  // This piece of code runs the following SQL query on the tweets table:
  // SELECT
  //   id,
  //   content,
  //   user_handle,
  //   created_at
  //   FROM tweets
  //   WHERE id = {tweet_id_num};
  const [tweetData] = await db
    .select({
      id: tweetsTable.id,
      content: tweetsTable.content,
      userHandle: tweetsTable.userHandle,
      createdAt: tweetsTable.createdAt,
      startTime: tweetsTable.startTime, 
      endTime: tweetsTable.endTime, 
    })
    .from(tweetsTable)
    .where(eq(tweetsTable.id, tweet_id_num))
    .execute();

  // Although typescript thinks tweetData is not undefined, it is possible
  // that tweetData is undefined. This can happen if the tweet doesn't exist.
  // Thus the destructuring assignment above is not safe. We need to check
  // if tweetData is undefined before using it.
  if (!tweetData) {
    errorRedirect();
  }

  // This piece of code runs the following SQL query on the tweets table:
  // SELECT
  //  id,
  //  FROM likes
  //  WHERE tweet_id = {tweet_id_num};
  // Since we only need the number of likes, we don't actually need to select
  // the id here, we can select a constant 1 instead. Or even better, we can
  // use the count aggregate function to count the number of rows in the table.
  // This is what we do in the next code block in likesSubquery.
  const likes = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(eq(likesTable.tweetId, tweet_id_num))
    .execute();
  const numLikes = likes.length;

  const [liked] = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.tweetId, tweet_id_num),
        eq(likesTable.userHandle, handle ?? ""),
      ),
    )
    .execute();

  const [user] = await db
    .select({
      displayName: usersTable.displayName,
      handle: usersTable.handle,
    })
    .from(usersTable)
    .where(eq(usersTable.handle, tweetData.userHandle))
    .execute();

  const tweet = {
    id: tweetData.id,
    content: tweetData.content,
    username: user.displayName,
    handle: user.handle,
    likes: numLikes,
    createdAt: tweetData.createdAt,
    liked: Boolean(liked),
    startTime: tweetData.startTime,
    endTime: tweetData.endTime, 
  };

  // The following code is almost identical to the code in src/app/page.tsx
  // read the comments there for more info.
  const likesSubquery = db.$with("likes_count").as(
    db
      .select({
        tweetId: likesTable.tweetId,
        likes: sql<number | null>`count(*)`.mapWith(Number).as("likes"),
      })
      .from(likesTable)
      .groupBy(likesTable.tweetId),
  );

  const likedSubquery = db.$with("liked").as(
    db
      .select({
        tweetId: likesTable.tweetId,
        liked: sql<number>`1`.mapWith(Boolean).as("liked"),
      })
      .from(likesTable)
      .where(eq(likesTable.userHandle, handle ?? "")),
  );

  const replies = await db
    .with(likesSubquery, likedSubquery)
    .select({
      id: tweetsTable.id,
      content: tweetsTable.content,
      username: usersTable.displayName,
      handle: usersTable.handle,
      likes: likesSubquery.likes,
      createdAt: tweetsTable.createdAt,
      liked: likedSubquery.liked,
      startTime: tweetsTable.startTime,
      endTime: tweetsTable.endTime,
    })
    .from(tweetsTable)
    .where(eq(tweetsTable.replyToTweetId, tweet_id_num))
    .orderBy(asc(tweetsTable.createdAt))
    .innerJoin(usersTable, eq(tweetsTable.userHandle, usersTable.handle))
    .leftJoin(likesSubquery, eq(tweetsTable.id, likesSubquery.tweetId))
    .leftJoin(likedSubquery, eq(tweetsTable.id, likedSubquery.tweetId))
    .execute();
  
  // if not liked, delelte user time table
  if (!tweet.liked) {
    // If it's liked, delete the data from myChoices
    await db
      .delete(choicesTable)
      .where(
        and(
          eq(choicesTable.userHandle, handle ?? ""),
          eq(choicesTable.tweetId, tweet_id_num)
        )
      )
      .execute();
  }

  // userChoose
  const choiceUsers = await db
    .select({
      userHandle: sql`DISTINCT ON (user_handle) user_handle`,
    })
    .from(choicesTable)
    .where(eq(choicesTable.tweetId, tweet_id_num))
    .execute();
  const numchoiceUsers = choiceUsers.length;
  // console.log(numchoiceUsers);

  const userChoices = await db
    .select({
      date: choicesTable.date,
      hour: choicesTable.hour,
    })
    .from(choicesTable)
    .where(
      and(
        not(eq(choicesTable.userHandle,  handle ?? "")), 
        eq(choicesTable.tweetId, tweet_id_num)
      )
    )
    .execute();
  // console.log("userchoices");
  // console.log(userChoices);

  const myChoices = await db
    .select({
      date: choicesTable.date,
      hour: choicesTable.hour,
    })
    .from(choicesTable)
    .where(
      and(
        eq(choicesTable.userHandle, handle ?? ""),
        eq(choicesTable.tweetId, tweet_id_num)
      )
    )
    .execute();
  // console.log("mychoices");
  // console.log(myChoices);

  // dates
  const [Startdate, Starthour] = tweet.startTime.split(' ');
  const [Startyear, Startmonth, Startday] = Startdate.split('-');
  // console.log(Startyear);
  const startTable = [parseInt(Startyear), parseInt(Startmonth), parseInt(Startday), parseInt(Starthour)];
  const [Enddate, Endhour] = tweet.endTime.split(' ');
  const [Endyear, Endmonth, Endday] = Enddate.split('-');
  // console.log(Endyear);
  const endTable = [parseInt(Endyear), parseInt(Endmonth), parseInt(Endday), parseInt(Endhour)];

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-scroll pt-2 px-6">
        <div className="my-2 mx-2 flex items-center gap-8">
          <Link href={{ pathname: "/", query: { username, handle } }}>
            {/* <ArrowLeft size={18} /> */}
            <ChevronLeftCircleIcon size={32} style={{ fill: 'green-500' }} />
          </Link>
          {/* <h1 className="text-xl font-bold">Tweet</h1> */}
        </div>
        <div className="flex flex-col">
          {/* <div className="flex justify-between">
             <div className="flex w-full gap-3">
              eslint-disable-next-line @next/next/no-img-element
              <img
                src={getAvatar(tweet.username)}
                alt="user avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-bold">{tweet.username ?? "..."}</p>
                <p className="font-normal text-gray-500" style={{ display: 'none' }}>
                  @{tweet.handle ?? "..."}
                </p>
              </div>
            </div>
            <button className="h-fit rounded-full p-2.5 text-gray-400 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
              <MoreHorizontal size={16} />
            </button>
          </div>*/}
          <article className="m-3 whitespace-pre-wrap text-xl">
            {tweet.content}
          </article>
          <time className="mb-2 mx-2 block text-sm text-bold" >
            <span className="mx-2 text-green-900 text-normal">From</span> 
            <TimeText date={tweet.startTime} format="YYYY MM/DD  h A"  text-green-900 />
            <span className="mx-2 text-green-900 text-normal">To</span> 
            <TimeText date={tweet.endTime} format="YYYY MM/DD  h A" />
            {/* <TimeText date={tweet.createdAt} format="h:mm A · D MMM YYYY" /> */}
          </time>
          <Separator />
          <div className="my-2 flex items-center justify-start gap-4 text-green-900">
            <LikeButton
              handle={handle}
              initialLikes={tweet.likes}
              initialLiked={tweet.liked}
              tweetId={tweet.id}
            />
          </div>
          {/* <Separator /> */}
        </div>
        <div className="flex">
          <div className="w-5/12">
            <ReplyInput replyToTweetId={tweet.id} replyToHandle={tweet.handle} initialLiked={tweet.liked} />
            <Separator />
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                username={username}
                content={reply.content}
                authorName={reply.username}
                authorHandle={reply.handle}
              />
            ))}
          </div>
          <div className="w-1/12">
            <table className="border-2 border-black w-full m-1">
              <thead>
                <tr>
                  {/* {Array.from({ length: days }, (_, i) => (
              <th key={i}>Column {i + 1}</th>
            ))} */}
                  <th className="border border-black">0-24</th>
                </tr>
              </thead>
              <tbody className="table-body h-16">
                {Array.from({ length: 24 }, (_, hourIndex) => (
                  <tr key={hourIndex} className="table-row text-center align-center h-6">
                    <td className="border border-black text-sm">{hourIndex} - {hourIndex + 1} </td>                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-1/2">
            <TableInput numchoiceUsers={numchoiceUsers} userChoices={userChoices} myChoices={myChoices} tweetId={tweet.id} startTable={startTable} endTable={endTable} initialLiked={tweet.liked} handle={handle}/>
            {/* Todo: 加上使用者資訊 */}
          </div>
        </div>
        
      </div>
    </>
  );
}
