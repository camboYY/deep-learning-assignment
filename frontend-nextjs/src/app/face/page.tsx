"use client";

import { useCreateAttendanceMutation } from "@/store/attendanceApi";
import { useVerifyFaceMutation } from "@/store/faceApi";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [verifyFace, { isLoading, error, reset, data, isSuccess, isError }] =
    useVerifyFaceMutation();
  const [
    createAttendance,
    {
      isLoading: isLoadingCreate,
      error: errorCreate,
      reset: resetCreate,
      data: dataCreate,
      isSuccess: isSuccessCreate,
      isError: isErrorCreate,
    },
  ] = useCreateAttendanceMutation();

  // Function to start camera
  const startCamera = async () => {
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
      toast.error("Failed to access webcam");
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    const tracks =
      (videoRef.current?.srcObject as MediaStream)?.getTracks?.() || [];
    tracks.forEach((t) => t.stop());
    setStreaming(false);
  };

  const handleReset = async () => {
    reset(); // clear mutation state
    await stopCamera(); // stop current stream
    await startCamera(); // start camera again
  };

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
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
  const handleVerify = async () => {
    const imageBase64 = captureImage();
    if (!imageBase64) return;
    try {
      const res = await verifyFace({ imageBase64 }).unwrap();
      const success = res.score >= 0.7;
      if (success) {
        // Option 3: Slice last characters (if format is fixed)
        const match = res?.employee_id?.match(/\d+/);
        const employeeNumber = match ? parseInt(match[0], 10) : null;

        await createAttendance({
          employeeId: Number(employeeNumber),
          status: success ? "PRESENT" : "ABSENT",
        }).unwrap();
      }
      toast.success(
        res.score >= 0.7
          ? `✅ Verified! Score: ${res.score.toFixed(2)}`
          : "❌ No match found"
      );
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Face verification failed");
    }
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
          disabled={!streaming || isLoading}
        >
          {isLoading ? "Verifying..." : "Verify Face"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 text-center">
        <strong>Status:</strong>{" "}
        {isLoading
          ? "Verifying..."
          : isSuccess
          ? "Success ✅"
          : isError
          ? "Failed ❌"
          : "Idle"}
      </div>
    </div>
  );
}
