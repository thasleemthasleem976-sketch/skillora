import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Users,
  Eye,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { ProctoringDetector } from '../../services/proctoringDetector';

export default function ProctoringWebcamBox({
  examId,
  onViolationCountChange,
  showFullDetails = false,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [faceStatus, setFaceStatus] = useState({ status: 'initializing', count: 0 });
  const [violations, setViolations] = useState([]);
  const [latestWarning, setLatestWarning] = useState(null);

  // Initialize camera and proctoring detector
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });

        if (!isMounted) return;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        setCameraActive(true);

        // Initialize detector
        const detector = new ProctoringDetector({
          examId,
          onWarning: (warning) => {
            if (!isMounted) return;
            setLatestWarning(warning);
            setViolations((prev) => [warning, ...prev.slice(0, 19)]);
            if (onViolationCountChange) {
              onViolationCountChange(warning.totalViolations);
            }
          },
          onFaceStatusUpdate: (status) => {
            if (!isMounted) return;
            setFaceStatus(status);
          },
        });

        detectorRef.current = detector;
        await detector.init(videoRef.current);
        detector.start();
      } catch (err) {
        if (!isMounted) return;
        console.error('Webcam permission error:', err);
        setCameraError('Camera access denied or unavailable. Automated proctoring requires webcam feed.');
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (detectorRef.current) {
        detectorRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [examId]);

  return (
    <div className="rounded-3xl glass-card overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-white/80">
      {/* Header */}
      <div className="px-4 py-3 bg-white/70 backdrop-blur-md border-b border-white/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              faceStatus.status === 'normal' ? 'bg-emerald-400' : 'bg-red-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              faceStatus.status === 'normal' ? 'bg-emerald-500' : 'bg-red-500'
            }`}></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-800">
            Automated Proctoring
          </span>
        </div>
        <div className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/40 border border-white text-gray-800 font-bold shadow-xs">
          Violations: {violations.length}
        </div>
      </div>

      {/* Video stream container */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-amber-300">{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Status pill badge on top of video */}
            <div className="absolute top-2.5 left-2.5 z-10">
              {faceStatus.status === 'normal' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1 Face Detected</span>
                </div>
              ) : faceStatus.status === 'no_face' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 border border-red-400 text-white text-[11px] font-bold backdrop-blur-xs animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span>Face Not Detected</span>
                </div>
              ) : faceStatus.status === 'multiple_faces' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 border border-red-400 text-white text-[11px] font-bold backdrop-blur-xs animate-pulse">
                  <Users className="w-3.5 h-3.5 text-white" />
                  <span>Multiple Faces ({faceStatus.count})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[11px]">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Calibrating...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Real-time warning alert strip */}
      {latestWarning && (
        <div
          className={`p-3 text-xs flex items-start gap-2.5 border-t ${
            latestWarning.severity === 'critical'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{latestWarning.type.replace(/_/g, ' ')}</p>
            <p className="text-[11px] opacity-90">{latestWarning.message}</p>
          </div>
        </div>
      )}

      {/* Disclaimers */}
      <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500 text-center font-medium">
        Basic AI face and tab focus monitoring active.
      </div>
    </div>
  );
}
