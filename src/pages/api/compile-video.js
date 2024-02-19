const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Helper function to convert base64 to a Buffer
function base64ToArrayBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

async function saveFramesToVideo2(frames, frameRate, videoId) {
  const fs = require("fs");
  const { execSync } = require("child_process");

  // Write frames to disk
  const frameDir = "./frames";
  if (!fs.existsSync(frameDir)) {
    fs.mkdirSync(frameDir);
  }

  frames.forEach((frame, index) => {
    fs.writeFileSync(`${frameDir}/frame-${index}.png`, frame);
  });

  // Use FFmpeg to create a video from the frames
  execSync(
    `ffmpeg -framerate ${frameRate} -i ${frameDir}/frame-%d.png -c:v libx264 -r 30 -pix_fmt yuv420p public/output.mp4`
  );

  // Optionally, clean up frames
  fs.rmdirSync(frameDir, { recursive: true });
  db[videoId] = true;
}
// Function to save frames and compile them into a video
async function saveFramesToVideo(frames, frameDir, videoPath) {
  // Write frames to disk asynchronously
  await Promise.all(
    frames.map((frame, index) =>
      fs.promises.writeFile(`${frameDir}/frame-${index + 1}.png`, frame)
    )
  );

  // Compile the frames into a video using FFmpeg
  const command = `ffmpeg -framerate 24 -i ${frameDir}/frame-%d.png -c:v libx264 -r 30 -pix_fmt yuv420p ${videoPath}`;
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        console.error("FFmpeg error:", error);
        return reject(error);
      }
      resolve(videoPath);
    });
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  if (req.method === "POST") {
    // Extract frames and job info from request body
    const { frames, jobId, finalChunk } = req.body;
    const framesBufferArray = frames.map(base64ToArrayBuffer);

    // Define directories and paths
    const jobDir = path.join(process.cwd(), "public", "jobs", jobId);
    const frameDir = path.join(jobDir, "frames");
    const videoPath = path.join(jobDir, "output.mp4");

    // Ensure job and frame directories exist
    if (!fs.existsSync(frameDir)) {
      fs.mkdirSync(frameDir, { recursive: true });
    }

    try {
      // Save current chunk of frames
      await saveFramesToVideo(framesBufferArray, frameDir, videoPath);

      if (finalChunk) {
        // If this is the final chunk, compile the frames into a video
        await saveFramesToVideo(framesBufferArray, frameDir, videoPath);
        // Cleanup frames after compilation
        fs.rmdirSync(frameDir, { recursive: true });

        // Respond with the URL to the compiled video
        const videoUrl = videoPath.replace(process.cwd(), "");
        res
          .status(200)
          .json({ message: "Video compiled successfully", videoUrl });
      } else {
        // If not the final chunk, simply acknowledge the receipt
        res.status(202).json({ message: "Chunk received" });
      }
    } catch (error) {
      // Handle errors
      res
        .status(500)
        .json({ message: "Failed to compile video", error: error.toString() });
    }
  } else {
    // Handle non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
