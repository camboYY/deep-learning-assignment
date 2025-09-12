"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { enrollFace, resetResult, verifyFace } from "@/store/faceSlice";
import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

export default function VerifyPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispatch = useAppDispatch();
  const { status, result, error } = useAppSelector((s) => s.face);
  const [streaming, setStreaming] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
    }
    loadModels();
  }, []);

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

  // Live detection loop (bounding boxes on top of video)
  useEffect(() => {
    if (!streaming || !modelsLoaded) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    const detect = async () => {
      resizeCanvas();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      // Draw bounding boxes
      detections.forEach((det) => {
        const { x, y, width, height } = det.box;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
      });

      requestAnimationFrame(detect);
    };

    detect();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [streaming, modelsLoaded]);

  // Auto verify every 5s
  useEffect(() => {
    if (!streaming || !modelsLoaded) return;
    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      console.log(detections);
      if (detections.length === 1) {
        // capture current frame for verification
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);
        const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
        dispatch(verifyFace({ imageBase64 }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [streaming, modelsLoaded, dispatch]);

  // Manual enrollment
  async function handleEnroll() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detections.length !== 1) {
      alert("Please make sure exactly one face is visible for enrollment.");
      return;
    }

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

    const name = prompt("Enter employee ID or name for enrollment");
    if (!name) return;
    dispatch(enrollFace({ imageBase64, id: name }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Employee Face Verification (Live Overlay)
      </h1>

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
            pointerEvents: "none", // allows clicks to pass through
          }}
        />
      </div>

      <div className="mt-4 flex gap-3 justify-center">
        <button
          onClick={handleEnroll}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Enroll Manually
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
