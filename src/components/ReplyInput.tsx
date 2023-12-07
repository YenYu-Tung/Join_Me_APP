"use client";

import { useRef } from "react";

// import GrowingTextarea from "@/components/GrowingTextarea";
// import UserAvatar from "@/components/UserAvatar";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
// import { cn } from "@/lib/utils";

type ReplyInputProps = {
  replyToTweetId: number;
  replyToHandle: string;
  initialLiked: boolean;
};

export default function ReplyInput({
  replyToTweetId, initialLiked
  // replyToHandle,
}: ReplyInputProps) {
  const { username, handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { postTweet, loading } = useTweet();

  const handleReply = async () => {
    const content = textareaRef.current?.value;
    if (!content) return;
    if (!handle) return;
    const startTime = "2000-10-00 12";
    const endTime = "2000-10-00 12";
    try {
      await postTweet({
        handle,
        content,
        replyToTweetId,
        startTime, // 新增 startTime
        endTime,   // 新增 endTime
      });
      textareaRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
    } catch (e) {
      console.error(e);
      alert("Error posting reply");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 防止換行
      handleReply();
    }
  };

  return (
    // this allows us to focus (put the cursor in) the textarea when the user
    // clicks anywhere on the div
    <div onClick={() => textareaRef.current?.focus()}>
      <div className={`justify-start items-center m-1 p-3 border-2 border-green-900 ${!initialLiked ? 'bg-gray-300/75' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* <UserAvatar className="col-start-1 row-start-2 h-12 w-12" /> */}
        <p className="col-start-2 row-start-1 text-black">
          {initialLiked ? `${username}, 寫下你的留言` : "參加活動以加入討論"}
          {/* <span className="text-brand">@{replyToHandle}</span> */}
        </p>
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-lg outline-none placeholder:text-green-900 w-full"
          placeholder="Write a comment..."
          disabled={!initialLiked || loading}
        />
      </div>
      {/* <div className="text-end">
        {initialLiked && (
          <button
            className={cn(
              "my-2 rounded-full bg-white px-4 py-2 text-green-700 transition-colors hover:bg-green-200",
              "disabled:cursor-not-allowed disabled:bg-green-700 disabled:hover:bg-green-500 border-2 border-green-900",              
            )}
            onClick={handleReply}
            disabled={loading}
          >
            發布
          </button>
        )}
      </div> */}
    </div>
  );
}
