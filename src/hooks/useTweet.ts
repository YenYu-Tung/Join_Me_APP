import { useState } from "react";

import { useRouter } from "next/navigation";

export default function useTweet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const [tweetId, setTweetId] = useState(0);

  const postTweet = async ({
    handle,
    content,
    replyToTweetId,
    startTime, // 新增的 startTime
    endTime,   // 新增的 endTime
  }: {
    handle: string;
    content: string;
    replyToTweetId?: number;
    startTime: string; // 新的 startTime 參數
    endTime: string;   // 新的 endTime 參數
  }) => {
    setLoading(true);

    const res = await fetch("/api/tweets", {
      method: "POST",
      body: JSON.stringify({
        handle,
        content,
        replyToTweetId,
        startTime, // 傳遞 startTime
        endTime,   // 傳遞 endTime
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    // const result = await res.json();
    // setTweetId(result.tweetId); // Set the tweetId from the response


    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.
    router.refresh();
    setLoading(false);
  };

  return {
    postTweet,
    loading,
    // tweetId,
  };
}
