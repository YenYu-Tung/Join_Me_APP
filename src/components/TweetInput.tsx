"use client";

import { useRef, useState } from "react";
import useLike from "@/hooks/useLike";
// import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import { tweetsTable } from "@/db/schema";
// import { desc} from "drizzle-orm";
// import { db } from "@/db";

import GrowingTextarea from "@/components/GrowingTextarea";
// import UserAvatar from "@/components/UserAvatar";
// import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";


import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

type TweetInputProps = {
  NewtweetId: number;
};

export default function TweetInput({
  NewtweetId,}: TweetInputProps) {
  const router = useRouter();
  const { username, handle } = useUserInfo();
  const { likeTweet} = useLike();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<HTMLTextAreaElement>(null);
  const endTimeRef = useRef<HTMLTextAreaElement>(null);

  const { postTweet, loading} = useTweet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalContent, setModalContent] = useState("");

  function parseDateString(dateString: string){
    const [datePart, hour] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    // Note: Months are 0-based in JavaScript, so we subtract 1 from the month
    const data = [parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour)];
    return data;
  }

  const handleTweet = async () => {
    const content = textareaRef.current?.value;
    const startTime = startTimeRef.current?.value; // 讀取 startTimeRef 的值
    const endTime = endTimeRef.current?.value; // 讀取 endTimeRef 的值

    if (!content || !startTime || !endTime) return; // 確保所有字段都已填寫
    if (!handle) return;

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      alert("請輸入有效的時間格式（YYYY-MM-DD HH）");
      return;
    }
    const now = new Date();
    
    const startTimeData = parseDateString(startTime);
    const endTimeData = parseDateString(endTime);

    const startTimeDate = new Date(startTimeData[0], startTimeData[1], startTimeData[2], startTimeData[3])
    const endTimeDate = new Date(endTimeData[0], endTimeData[1], endTimeData[2], endTimeData[3]);

    if (startTimeData[1] !== new Date(startTimeDate).getMonth() || endTimeData[1] !== new Date(endTimeDate).getMonth() ) {
      alert("不合法的時間");
      return;
    }    

    if (endTimeDate <= now || startTimeDate <= now) {
      alert("開始和結束時間必須大於現在時間");
      return;
    }

    if (endTimeDate <= startTimeDate) {
      alert("結束時間必須大於開始時間");
      return;
    }
    const timeDiff = endTimeDate.getTime() - startTimeDate.getTime();
    const maxTimeDiff = 7 * 24 * 60 * 60 * 1000; 

    if (timeDiff > maxTimeDiff) {
      alert("時間區間不能大於七天");
      return;
    }

    try {
      await postTweet({
        handle,
        content,
        startTime, // 新增 startTime
        endTime,   // 新增 endTime
      });
      /// sql
      // const tweetIdResult = await db
      //   .select({ id: tweetsTable.id })  // Use sql`lastval()` to get the last inserted ID
      //   .from(tweetsTable)
      //   .orderBy(desc(tweetsTable.id))
      //   .limit(1)
      //   .execute();   
      // const tweetId = tweetIdResult[0].id;   

      // console.log(NewtweetId);

      // Get the newly created tweetId from the response
      // const tweetId = response.tweetId;
      try {
        // Attempt to like the tweet
        await likeTweet({
          tweetId: NewtweetId,
          userHandle: handle,
        });
        // Handle success (e.g., update the UI)
        // console.log("Like was successful");
      } catch (error) {
        // Handle the error
        console.error("Error liking the tweet:", error);
      }

      textareaRef.current.value = "";
      startTimeRef.current.value = "";
      endTimeRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
      startTimeRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
      endTimeRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );

      // redirect
      const pathname = `/tweet/${NewtweetId}?username=${username}&handle=${handle}`;
      // const params = new URLSearchParams(searchParams);
      // params.set("username", username!);
      // params.set("handle", handle!);
      router.push(`${pathname}`);

    } catch (e) {
      console.error(e);
      // alert("Error posting tweet");
    }
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const isValidTimeFormat = (time: string) => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}$/;
    return regex.test(time);
  };

  return (
    <div className="flex gap-4 p-4">
      {/* <UserAvatar className="h-12 w-12" /> */}
      <button className="h-fit p-2.5 items-center rounded-full border-2 border-green-900 px-2 bg-white text-green-700 font-bold hover:bg-green-200" onClick={handleOpenModal}>
        新增活動
        {/* <ChevronDown size={16} className="text-gray-300" /> */}
      </button>
      {/* <div className="flex flex-col px-2">        
        <div className="mb-2 mt-6">
          <GrowingTextarea
            ref={textareaRef}
            className="bg-transparent outline-none placeholder:text-gray-500"
            placeholder="What's happening?"
          />
        </div>
        <Separator />        
      </div> */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <div className="mb-2">
            <GrowingTextarea
              ref={textareaRef}
              className="bg-transparent outline-none placeholder:text-gray-500"
              placeholder="輸入活動標題"
            />
            <span>From</span>
            <GrowingTextarea
              ref={startTimeRef}
              className="bg-transparent outline-none placeholder:text-gray-500 items-center"
              placeholder="年月日小時 (e.g., 2023-10-30 14)"
            />
            <span>To</span>
            <GrowingTextarea
              ref={endTimeRef}
              className="bg-transparent outline-none placeholder:text-gray-500 items-center"
              placeholder="年月日小時 (e.g., 2023-10-30 14)"
            />
          </div>
          <button
            onClick={() => {
              handleTweet();
              // handleCloseModal();
            }}
            className={cn(
              "rounded-full bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-800",
              "disabled:cursor-not-allowed disabled:bg-green-400 disabled:hover:bg-green-400",
            )}
            disabled={loading}
          >
            新增
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
