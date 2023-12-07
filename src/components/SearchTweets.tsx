"use client";
import { useState } from 'react';
import Tweet from "@/components/Tweet";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

// SearchTweets.js
type SearchProps = {
  username?: string;
  handle?: string;
  tweets: {
    id: number;
    content: string;
    username: string;
    handle: string;
    likes: number;
    createdAt: Date | null;
    startTime: string;
    endTime: string;
    liked: boolean;
  }[];
};

export default function SearchTweets({ tweets, username, handle }: SearchProps) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredTweets = tweets.filter((tweet) =>
    tweet.content.includes(searchKeyword)
  );

  return (
    <div className="px-4 justify-center items-center">
      <div className="py-2 flex justify-between items-center">
        <input
          className="w-full mr-1"
          type="text"
          placeholder="搜尋想參加的活動"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
        />
        <Search size={18} />
      </div>
      <Separator />
      {filteredTweets.map((tweet) => (
        <Tweet
          key={tweet.id}
          id={tweet.id}
          username={username}
          handle={handle}
          authorName={tweet.username}
          authorHandle={tweet.handle}
          content={tweet.content}
          likes={tweet.likes}
          liked={tweet.liked}
          createdAt={tweet.createdAt!}
          startTime={tweet.startTime}
          endTime={tweet.endTime}
        />
      ))}
    </div>
  );
}
