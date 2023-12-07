import Link from "next/link";

// import { MessageCircle, Repeat2, Share } from "lucide-react";

import { Separator } from "@/components/ui/separator";
// import { getAvatar } from "@/lib/utils";

import LikeDetail from "./LikeDetail";
// import TimeText from "./TimeText";

type TweetProps = {
  username?: string;
  handle?: string;
  id: number;
  authorName: string;
  authorHandle: string;
  content: string;
  likes: number;
  createdAt: Date;
  startTime: string;
  endTime: string;
  liked?: boolean;
};

// note that the Tweet component is also a server component
// all client side things are abstracted away in other components
export default function Tweet({
  username,
  handle,
  id,
  // authorName,
  // authorHandle,
  content,
  likes,
  // createdAt,
  liked,
  // startTime, 
  // endTime,
}: TweetProps) {
  return (
    <div className="hover:bg-gray-100">
      <Link
        className="w-full px-4 pt-3 transition-colors "
        href={{
          pathname: `/tweet/${id}`,
          query: {
            username,
            handle,
          },
        }}
      >
        <div className="flex gap-4 px-3 justify-between font-bold">
          <div className="flex items-center">
            {content}
          </div>
          {/* <article className="whitespace-pre-wrap">           
          </article> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img
            src={getAvatar(authorName)}
            alt="avatar"
            className="h-12 w-12 rounded-full"
          /> */}
          {/* <article className="flex grow" style={{ display: 'none' }}>
            <p className="font-bold">
              {authorName}
              <span className="ml-2 font-normal text-gray-400">
                @{authorHandle}
              </span>
              <time className="ml-2 font-normal text-gray-400">
                <TimeText date={createdAt} format="h:mm A · D MMM YYYY" />
                <TimeText date={startTime} format="h:mm A · D MMM YYYY" />
                <TimeText date={endTime} format="h:mm A · D MMM YYYY" />
              </time>
            </p>
            `white-space: pre-wrap` tells html to render \n and \t chracters           
          </article> */}
          <div className="mx-2 flex items-center justify-between gap-4 text-green-800 ">
            {/* <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
                <MessageCircle size={20} className="-scale-x-100" />
              </button> */}
            {/* <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
                <Repeat2 size={22} />
              </button> */}
            <LikeDetail
              initialLikes={likes}
              initialLiked={liked}
            // tweetId={id}
            // handle={handle}
            />
            {/* <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
                <Share size={18} />
              </button> */}
          </div>
        </div>
      </Link>
      <Separator />
    </div>
  );
}
