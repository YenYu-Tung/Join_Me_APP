"use client";

// import { useState } from "react";
// import type { EventHandler, MouseEvent } from "react";

import { Check } from "lucide-react";

// import useLike from "@/hooks/useLike";
import { cn } from "@/lib/utils";

type LikeDetailProps = {
  initialLikes: number;
  initialLiked?: boolean;
  // tweetId: number;
  // handle?: string;
};

export default function LikeDetail({
  initialLikes,
  initialLiked,
  // tweetId,
  // handle,
}: LikeDetailProps) {
  // const [liked, setLiked] = useState(initialLiked);
  const liked = initialLiked;
  // const [likesCount, setLikesCount] = useState(initialLikes);
  const likesCount = initialLikes;
  // const { likeTweet, unlikeTweet } = useLike();

  // const handleClick: EventHandler<MouseEvent> = async (e) => {
  //   // since the parent node of the button is a Link, when we click on the
  //   // button, the Link will also be clicked, which will cause the page to
  //   // navigate to the tweet page, which is not what we want. So we stop the
  //   // event propagation and prevent the default behavior of the event.
  //   e.stopPropagation();
  //   e.preventDefault();
  //   if (!handle) return;
  //   if (liked) {
  //     await unlikeTweet({
  //       tweetId,
  //       userHandle: handle,
  //     });
  //     setLikesCount((prev) => prev - 1);
  //     setLiked(false);
  //   } else {
  //     await likeTweet({
  //       tweetId,
  //       userHandle: handle,
  //     });
  //     setLikesCount((prev) => prev + 1);
  //     setLiked(true);
  //   }
  // };

  return (
    <div
      className="flex items-center gap-3"
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full p-1.5",
          liked && "bg-green-300",
          !liked && "hidden"
        )}
      >
        <Check size={24} />
      </div>
      {likesCount > 0 ? `${likesCount} 人參加` : "0 人參加"}
    </div>
  );
}
