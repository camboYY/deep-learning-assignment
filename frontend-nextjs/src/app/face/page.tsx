"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { resetResult, verifyFace } from "@/store/faceSlice";
import { useEffect, useRef, useState } from "react";

export default function VerifyPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useAppDispatch();
  const { status, result, error } = useAppSelector((s) => s.face);
  const [streaming, setStreaming] = useState(false);

  // Start webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    }

    startCamera();

    return () => {
      const tracks =
        (videoRef.current?.srcObject as MediaStream)?.getTracks?.() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  // Capture frame from video
  const captureImage = (): string | undefined => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  };

  // Submit image to FastAPI
  const handleVerify = () => {
    const imageBase64 = captureImage();
    if (!imageBase64) return;
    dispatch(verifyFace({ imageBase64 }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Employee Face Verification</h1>

      <div className="relative w-[640px] h-[480px] mx-auto">
        <video
          ref={videoRef}
          className="rounded shadow"
          width={640}
          height={480}
          autoPlay
          muted
          playsInline
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref={canvasRef}
          className="rounded shadow"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      <div className="mt-4 flex gap-3 justify-center">
        <button
          onClick={handleVerify}
          className="px-4 py-2 rounded bg-blue-600 text-white"
          disabled={!streaming}
        >
          Verify Face
        </button>
        <button
          onClick={() => dispatch(resetResult())}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 text-center">
        <strong>Status:</strong> {status} <br />
        {result && <div className="mt-2">Result: {JSON.stringify(result)}</div>}
        {error && <div className="text-red-600 mt-2">Error: {error}</div>}
      </div>
    </div>
  );
}
