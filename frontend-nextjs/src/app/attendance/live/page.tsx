"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState<any>(null);
  const deviceId = "kiosk-1";

  useEffect(() => {
    let stream: MediaStream;

    async function init() {
      // Camera
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // WebSocket
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost/ws/attendance"
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        ws.send(JSON.stringify({ deviceId })); // hello
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "result") setResult(msg);
      };
      ws.onclose = () => setStatus("closed");
      ws.onerror = () => setStatus("error");
    }

    init();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      wsRef.current?.close();
    };
  }, []);

  // Frame pump
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !videoRef.current ||
        !canvasRef.current ||
        !wsRef.current ||
        wsRef.current.readyState !== 1
      )
        return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);

      // Compress to jpeg for smaller payloads
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      wsRef.current.send(
        JSON.stringify({ type: "frame", deviceId, image: dataUrl })
      );
    }, 450); // keep in sync with server throttle

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-4">Live Attendance</h1>
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <div className="rounded-2xl overflow-hidden shadow bg-black">
          <video
            ref={videoRef}
            className="w-[640px] h-[480px] object-cover"
            playsInline
            muted
          />
        </div>
        <div className="rounded-2xl border bg-white p-4 w-[320px] shadow">
          <div className="text-sm text-gray-500 mb-2">
            WS Status: <b>{status}</b>
          </div>
          <pre className="text-xs whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
      {/* Hidden canvas for encoding frames */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
