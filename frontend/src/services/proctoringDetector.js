// Client-side automated exam proctoring engine
import api from './api';

export class ProctoringDetector {
  constructor({ examId, onWarning, onFaceStatusUpdate }) {
    this.examId = examId;
    this.onWarning = onWarning || (() => {});
    this.onFaceStatusUpdate = onFaceStatusUpdate || (() => {});
    this.videoElement = null;
    this.isRunning = false;
    this.intervalId = null;
    this.lastViolationTime = {};
    this.lastFaceCentroid = null;
    this.violationCount = 0;
    this.isFaceApiLoaded = false;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  // Initialize face-api if available in window or initialize smart canvas fallback
  async init(videoElement) {
    this.videoElement = videoElement;

    // Check if faceapi is loaded in window
    if (window.faceapi && window.faceapi.nets) {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ]);
        this.isFaceApiLoaded = true;
        console.log('[Proctoring] FaceAPI.js TinyFaceDetector loaded successfully.');
      } catch (err) {
        console.warn('[Proctoring] FaceAPI CDN load failed, using smart frame luminance/motion analyzer:', err.message);
        this.isFaceApiLoaded = false;
      }
    } else {
      console.log('[Proctoring] Using real-time Canvas Computer Vision analyzer for face/presence monitoring.');
    }

    this.setupWindowListeners();
  }

  setupWindowListeners() {
    this.handleVisibilityChange = () => {
      if (document.hidden && this.isRunning) {
        this.triggerViolation(
          'TAB_WINDOW_SWITCH',
          'Warning: Please stay on the examination window. Tab switch detected.',
          'critical'
        );
      }
    };

    this.handleWindowBlur = () => {
      if (this.isRunning) {
        this.triggerViolation(
          'TAB_WINDOW_SWITCH',
          'Warning: Window focus lost. Please stay focused on the exam screen.',
          'warning'
        );
      }
    };

    this.handleFullscreenChange = () => {
      if (!document.fullscreenElement && this.isRunning) {
        this.triggerViolation(
          'FULLSCREEN_EXITED',
          'Warning: Full-screen examination mode exited.',
          'warning'
        );
      }
    };

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Log Exam Started
    this.logEvent('EXAM_STARTED', 'Student commenced proctored examination.', 'info');

    // Run detection loop every 1200ms
    this.intervalId = setInterval(() => {
      this.detectFrame();
    }, 1200);
  }

  async detectFrame() {
    if (!this.isRunning || !this.videoElement || this.videoElement.readyState < 2) return;

    try {
      if (this.isFaceApiLoaded && window.faceapi) {
        const options = new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
        const detections = await window.faceapi.detectAllFaces(this.videoElement, options);

        if (!detections || detections.length === 0) {
          this.onFaceStatusUpdate({ status: 'no_face', count: 0 });
          this.triggerViolation(
            'FACE_NOT_DETECTED',
            'Warning: Face not detected. Please ensure your face is clearly visible to the camera.',
            'warning'
          );
        } else if (detections.length > 1) {
          this.onFaceStatusUpdate({ status: 'multiple_faces', count: detections.length });
          this.triggerViolation(
            'MULTIPLE_FACES_DETECTED',
            `Warning: Multiple faces detected (${detections.length}). Only the student is allowed in the frame.`,
            'critical'
          );
        } else {
          // Exactly 1 face detected
          const box = detections[0].box;
          const currentCentroid = {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
          };

          if (this.lastFaceCentroid) {
            const dx = Math.abs(currentCentroid.x - this.lastFaceCentroid.x);
            const dy = Math.abs(currentCentroid.y - this.lastFaceCentroid.y);
            if (dx > 90 || dy > 80) {
              this.triggerViolation(
                'SUSPICIOUS_HEAD_MOVEMENT',
                'Warning: Excessive head movement or looking away detected.',
                'warning'
              );
            }
          }
          this.lastFaceCentroid = currentCentroid;
          this.onFaceStatusUpdate({ status: 'normal', count: 1, box });
        }
      } else {
        // Fallback: Real-time Canvas Frame Luminance & Movement Inspection
        this.canvas.width = 160;
        this.canvas.height = 120;
        this.ctx.drawImage(this.videoElement, 0, 0, 160, 120);
        const imageData = this.ctx.getImageData(0, 0, 160, 120);
        const data = imageData.data;

        let totalBrightness = 0;
        let skinTonePixels = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;

          // Simple skin tone heuristic
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
            skinTonePixels++;
          }
        }

        const avgBrightness = totalBrightness / (data.length / 16);
        const skinRatio = skinTonePixels / (data.length / 16);

        if (avgBrightness < 15 || skinRatio < 0.05) {
          this.onFaceStatusUpdate({ status: 'no_face', count: 0 });
          this.triggerViolation(
            'FACE_NOT_DETECTED',
            'Warning: Face not detected. Please ensure sufficient lighting and look at the camera.',
            'warning'
          );
        } else {
          this.onFaceStatusUpdate({ status: 'normal', count: 1 });
        }
      }
    } catch (e) {
      // Non-fatal frame catch
    }
  }

  triggerViolation(type, message, severity = 'warning') {
    const now = Date.now();
    const lastTime = this.lastViolationTime[type] || 0;

    // Rate limit each violation type to once every 5 seconds to prevent spam
    if (now - lastTime < 5000) {
      return;
    }

    this.lastViolationTime[type] = now;
    this.violationCount += 1;

    // Notify UI immediately to display warning toast / sound
    this.onWarning({
      type,
      message,
      severity,
      totalViolations: this.violationCount,
      timestamp: new Date(),
    });

    // Send log to MongoDB via API
    this.logEvent(type, message, severity);
  }

  async logEvent(eventType, message, severity) {
    try {
      await api.post('/proctoring/log', {
        examId: this.examId,
        eventType,
        message,
        severity,
        metaData: {
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        },
      });
    } catch (err) {
      console.warn('[Proctoring] Failed to log proctoring event to backend:', err.message);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }
}
