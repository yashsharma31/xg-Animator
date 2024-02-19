import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

// Assuming PixiComponentNoSSR renders a PixiJS canvas
const PixiComponentNoSSR = dynamic(
  () => import("../components/PixiComponent"),
  { ssr: false }
);
const LottieComponent = dynamic(
  () => import("../components/LottiePixiComponent"),
  { ssr: false }
);

const Home = () => {
  const [frames, setFrames] = useState<string[]>([]);
  const animationContainerRef = useRef<HTMLDivElement>(null);

  const captureFrames = async () => {
    const capturedFrames: string[] = [];

    for (let i = 0; i < 30; i++) {
      // Assuming the PixiJS canvas is ready and visible
      const pixiCanvas = document.querySelector(
        "#animation-container canvas"
      ) as HTMLCanvasElement;
      if (pixiCanvas) {
        const pixiDataURL = pixiCanvas.toDataURL("image/png");
        capturedFrames.push(pixiDataURL);
      }

      // Capture Lottie and other HTML content
      // Note: This is a simplistic approach; in practice, you might need to ensure animations are in the desired state for capture
      const htmlCanvas = await html2canvas(animationContainerRef.current!);
      capturedFrames.push(htmlCanvas.toDataURL("image/png"));

      // Introduce a delay between captures to simulate time progression
      // Be cautious with this in a real app; this is for demonstration
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
    }

    setFrames(capturedFrames);
  };

  const downloadVideo = async () => {
    const jobId = uuidv4(); // Generate a unique job ID for this upload session
    const chunkSize = 20; // Number of frames per chunk
    let chunkIndex = 0; // To keep track of the current chunk being sent

    for (let i = 0; i < frames.length; i += chunkSize) {
      const chunk = frames.slice(i, i + chunkSize);
      const isFinalChunk = i + chunkSize >= frames.length; // Check if this is the final chunk

      const response = await fetch("/api/compile-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames: chunk,
          jobId,
          isFinalChunk,
          chunkIndex: chunkIndex++,
        }),
      });

      if (!response.ok) {
        console.error("Failed to upload chunk");
        return; // Exit the loop and function on failure
      }

      // Optional: Handle progress or intermediate responses here
    }

    // After all chunks have been sent, request the compiled video URL
    const finalResponse = await fetch(`/api/get-video-url?jobId=${jobId}`);
    if (finalResponse.ok) {
      const { videoUrl } = await finalResponse.json();
      window.location.href = videoUrl; // Or handle the video URL as needed
    } else {
      console.error("Failed to compile video");
    }
  };

  return (
    <>
      <Head>
        <title>Next.js with PixiJS and Lottie</title>
      </Head>
      <main className="container mx-auto p-4">
        <button
          id="animation-container"
          onClick={captureFrames}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Capture Frames
        </button>
        <button
          onClick={downloadVideo}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Download Video
        </button>
        <div
          ref={animationContainerRef}
          className="bg-slate-500 w-[100px] h-[200px] flex relative border-2 border-black"
        >
          <PixiComponentNoSSR />
          <LottieComponent />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {frames.map((frame, index) => (
            <Image
              key={index}
              src={frame}
              width={200}
              height={400}
              alt={`Frame ${index + 1}`}
              className="w-full border"
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
