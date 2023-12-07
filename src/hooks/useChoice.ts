import { useState } from "react";
import { useRouter } from "next/navigation";

export default function useChoice() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const chooseTime = async ({
    tweetId,
    userHandle,
    date,
    hour,
  }: {
    tweetId: number;
    userHandle: string;
    date: number; // 日期
    hour: number; // 小時
  }) => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/choices", {
      method: "POST",
      body: JSON.stringify({
        tweetId,
        userHandle,
        date,
        hour,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    router.refresh();
    setLoading(false);
  };

  const unchooseTime = async ({
    tweetId,
    userHandle,
    date,
    hour,
  }: {
    tweetId: number;
    userHandle: string;
    date: number; // 日期
    hour: number; // 小時
  }) => {
    if (loading) return;

    setLoading(true);
    const res = await fetch("/api/choices", {
      method: "DELETE",
      body: JSON.stringify({
        tweetId,
        userHandle,
        date,
        hour,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    router.refresh();
    setLoading(false);
  };

  return {
    chooseTime,
    unchooseTime,
    loading,
  };
}
