"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Icons } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  url: string;
}

export default function LiveVideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxLoadingDelay: 4,
        minAutoBitrate: 0,
        lowLatencyMode: true,
        enableWorker: true,
        backBufferLength: 90,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(() => {
          setIsBuffering(false);
        });
      });

      let retryCount = 0;
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                // Stream offline or 404
                setHasError(true);
                setIsBuffering(false);
              } else if (retryCount < 3) {
                retryCount++;
                hls.startLoad();
              } else {
                setHasError(true);
                setIsBuffering(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsBuffering(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari which natively supports HLS
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        setHasError(true);
        setIsBuffering(false);
      });
    }

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleLoadedData = () => setIsBuffering(false);
    const handlePause = () => setIsBuffering(false);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("pause", handlePause);
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] group ring-1 ring-white/5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(220,38,38,0.1)]">
      {/* Subtle Top Gradient for the Badge */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Premium LIVE Badge Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </span>
        <span className="text-[11px] font-bold tracking-widest text-white">LIVE</span>
      </div>

      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black z-0 relative"
        controls
        playsInline
        muted
        autoPlay
      />

      <AnimatePresence>
        {/* Premium Buffering Overlay */}
        {isBuffering && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
              <Icons.MonitorPlay className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-white/90 font-bold tracking-[0.2em] text-xs uppercase"
            >
              Connecting...
            </motion.p>
          </motion.div>
        )}

        {/* Premium Error Overlay */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="relative">
              <div className="absolute inset-0 bg-destructive/30 animate-pulse rounded-full blur-xl" />
              <div className="bg-gradient-to-br from-destructive/40 to-destructive/5 p-5 rounded-full border border-destructive/30 shadow-[0_0_40px_rgba(220,38,38,0.3)] relative z-10">
                <Icons.FiAlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </motion.div>

            <motion.h4
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-black text-white mt-6 mb-2 tracking-wider"
            >
              STREAM OFFLINE
            </motion.h4>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm max-w-[300px] text-center leading-relaxed"
            >
              The broadcaster has ended the stream or the connection was lost. Waiting for signal...
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Icons.RefreshCw className="w-4 h-4" />
              Retry Connection
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
