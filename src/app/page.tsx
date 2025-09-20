import Image from "next/image";
import apiClient from "@/lib/api/axios";

async function fetchHello(): Promise<string> {
  console.log('Making request to:', apiClient.defaults.baseURL);
  const res = await apiClient.get<{ message: string }>("");
  return res.data.message;
}

export default async function Home() {
  const hello = await fetchHello();
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38} 
          priority
        />
        <div className="text-base text-center sm:text-left">
          <p className="font-mono">Backend says: <span className="font-semibold">{hello}</span></p>
        </div>
      </main>
    </div>
  );
}
