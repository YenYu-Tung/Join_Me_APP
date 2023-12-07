"use client";

import { useState,  useEffect  } from "react";
// import type { MouseEvent } from "react";

import useChoice from "@/hooks/useChoice";
import { cn } from "@/lib/utils";

// import useUserInfo from "@/hooks/useUserInfo";

type TableInputProps = {
  numchoiceUsers: number;
  userChoices: {
    date: number;
    hour: number;
  }[];
  myChoices: {
    date: number;
    hour: number;
  }[];
  tweetId: number;
  handle?: string;
  startTable: number[];
  endTable: number[];
  initialLiked: boolean;
};

export default function LikeButton({
  numchoiceUsers,
  userChoices,
  myChoices,
  tweetId,
  handle,
  startTable,
  endTable,
  initialLiked,
}: TableInputProps) {
  // const { username } = useUserInfo();
  // console.log(numchoiceUsers,  handle);
  

  const [userstable, myowntable] = createInitialTable(startTable, endTable, myChoices, userChoices)
  const [table, setTable] = useState(userstable);
  const [mytable, setmyTable] = useState(myowntable);

  useEffect(() => {
    const [newTable, newMyTable] = createInitialTable(startTable, endTable, myChoices, userChoices);
    setTable(newTable);
    setmyTable(newMyTable);
  }, [startTable, endTable, myChoices, userChoices]);

  // console.log(table);
  // console.log(mytable);

  const { chooseTime, unchooseTime, loading} = useChoice();

  const startdate = startTable[0] + "/" + startTable[1] + "/" + startTable[2];
  const enddate = endTable[0] + "/" + endTable[1] + "/" + endTable[2];
  const days = Math.ceil((new Date(enddate).getTime() - new Date(startdate).getTime()) / (1000 * 3600 * 24 + 1)) + 1;
  /// 相差日數

  const handleCellClick = async (dayIndex: number, hourIndex: number) => {
    // console.log("click");
    if(!initialLiked){
      alert("先加入討論才能點選時間!");
      return;
    }
    if(loading){
      return;
    }
    if (table[dayIndex][hourIndex] === -1){
      return;
    }
    const date = dayIndex;
    const hour = hourIndex;
    const isChosen = mytable[dayIndex][hourIndex] === -1;
    const newTable = [...table];
    const newmyTable = [...mytable];
    if (!handle) return;

    if (isChosen) {
      await unchooseTime({
        tweetId,
        userHandle: handle,
        date,
        hour,
      });
      newTable[dayIndex][hourIndex]--;
      newmyTable[dayIndex][hourIndex] = 0;
    } else {
      await chooseTime({
        tweetId,
        userHandle: handle,
        date,
        hour,
      });
      newTable[dayIndex][hourIndex]++;
      newmyTable[dayIndex][hourIndex] = -1;
    }
    setTable(newTable);
    setmyTable(newmyTable);    
  };
  

  return (
    <>
      <table className="border-2 border-black w-full m-1 table-container">
        <thead>
          <tr>
            {/* {Array.from({ length: days }, (_, i) => (
              <th key={i}>Column {i + 1}</th>
            ))} */}
            {Array.from({ length: days }, (_, i) => {
              const currentDate = new Date(startdate);
              currentDate.setDate(currentDate.getDate() + i);
              const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}`;
              return <th className="border border-black" key={i}>{formattedDate}</th>;
            })}            
          </tr>
        </thead>
        <tbody className="table-body h-16">
          {Array.from({ length: 24 }, (_, hourIndex) => (
            <tr key={hourIndex} className="table-row h-6">
              {Array.from({ length: days }, (_, dayIndex) => (
                <td
                  key={dayIndex}
                  className={cn({
                    "border border-black": true,
                    "bg-gray-300": table[dayIndex][hourIndex] === -1,
                    "bg-white": table[dayIndex][hourIndex] === 0,
                    [`bg-green-${table[dayIndex][hourIndex] * 100}`]: table[dayIndex][hourIndex] > 0,
                    "my-slot": mytable[dayIndex][hourIndex] === -1,
                  })}
                  onClick={() => handleCellClick(dayIndex, hourIndex)}
                >       
                  
                  {/* <div className="cell-overlay" style={{ display: loading ? 'block' : 'none' }}></div> */}
                  {/* Render cell content */}
                  </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-7 gap-3 h-14 my-2  p-1">
        {Array.from({ length: numchoiceUsers+1 }, (_, i) => (
          <div key={i} className="text-center">
            <div
              className={`bg-green-${(i) * 100} border border-black h-6`}
            >
            </div>
            <span> {i} / {numchoiceUsers} </span>
          </div>          
        ))}
      </div>
      {/* <div className="flex justify-between">
        
        <span>   {numchoiceUsers} / {numchoiceUsers}     </span>
      </div> */}
    </>
  );
}

function createInitialTable(startTable: number[], endTable: number[], myChoices: {
  date: number;
  hour: number;
}[], userChoices: {
  date: number;
  hour: number;
}[]) {
  const startdate = startTable[0] + "/" + startTable[1] + "/" + startTable[2];
  const enddate = endTable[0] + "/" + endTable[1] + "/" + endTable[2];
  const days = Math.ceil((new Date(enddate).getTime() - new Date(startdate).getTime()) / (1000 * 3600 * 24 + 1)) + 1;

  // console.log(days);

  const table = Array(days).fill(null).map(() => Array(24).fill(0));
  const mytable = Array(days).fill(null).map(() => Array(24).fill(0));
  
  for (let i = 0; i < startTable[3]; i++) {
    table[0][i] = -1;
  }
  for (let i = endTable[3]; i < 24 ; i++) {
    table[days-1][i] = -1;
  }
  userChoices.forEach((choice) => {
    const dayIndex = choice.date;
    if (dayIndex >= 0 && choice.hour >= 0 && choice.hour < 24) {
      table[dayIndex][choice.hour]++;
    }
  });
  myChoices.forEach((choice) => {
    const dayIndex = choice.date;
    if (dayIndex >= 0 && choice.hour >= 0 && choice.hour < 24) {
      table[dayIndex][choice.hour]++;
      mytable[dayIndex][choice.hour] = -1;
    }
  });
  
  // console.log(table);
  // console.log(mytable);
  return [table, mytable];
}
