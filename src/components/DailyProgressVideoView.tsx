import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, 
  Camera, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Check, 
  Trash2, 
  Download, 
  Calendar, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Maximize2, 
  Film, 
  Mic, 
  RefreshCw,
  Eye,
  ChevronRight
} from 'lucide-react';
import { 
  saveVideoToVault, 
  getAllVideosFromVault, 
  deleteVideoFromVault, 
  StoredVideoRecord 
} from '../utils/videoStorage';

export const DailyProgressVideoView: React.FC = () => {
  const { profile } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  // Tab mode: 'record' | 'upload'
  const [ingestMode, setIngestMode] = useState<'record' | 'upload'>('record');

  // Vault videos state
  const [videos, setVideos] = useState<StoredVideoRecord[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState<StoredVideoRecord | null>(null);

  // Recorder state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form details for new video
  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Load vault videos from IndexedDB
  const loadVaultVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const records = await getAllVideosFromVault();
      if (records.length === 0) {
        // Pre-seed an initial sample demonstration record using a generated canvas video
        await createDemoCanvasVideo();
        const updated = await getAllVideosFromVault();
        setVideos(updated);
      } else {
        setVideos(records);
      }
    } catch (e) {
      console.warn('Error loading vault videos:', e);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    loadVaultVideos();
    return () => {
      stopCameraStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Generate a sleek canvas video for demo placeholder if user has no videos
  const createDemoCanvasVideo = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const stream = canvas.captureStream(25);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });

      recorder.start();

      let frame = 0;
      const animInterval = setInterval(() => {
        frame++;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gradient circle
        const grad = ctx.createLinearGradient(100, 100, 540, 260);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#6366f1');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(320, 180, 60 + Math.sin(frame * 0.1) * 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RE:SET — Day 1 Foundation Video', 320, 175);

        ctx.font = '14px monospace';
        ctx.fillStyle = '#a3a3a3';
        ctx.fillText('Sample Progress Check-in · Ready to record your own', 320, 205);

        if (frame >= 35) {
          clearInterval(animInterval);
          recorder.stop();
        }
      }, 50);

      const blob = await recordPromise;
      await saveVideoToVault({
        id: 'demo-sample-video',
        date: todayStr,
        title: 'Day 1 Commitment: Setting The Standard',
        notes: 'Documenting the baseline. Committed to 14 days of unflinching consistency, zero skipped gym sessions, and deep focus.',
        durationSeconds: 15,
        blob,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Demo video generation skipped:', e);
    }
  };

  // Camera Management
  const startCameraStream = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.error('Camera permission or availability error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera or microphone access was denied. Please allow camera permissions in your browser or switch to "Upload Video" tab.'
          : 'Could not access camera device. You can directly upload a recorded video file instead.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };

  // Recording Controls
  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      // Pick supported mimeType
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      let selectedMime = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(cameraStream, selectedMime ? { mimeType: selectedMime } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'video/webm';
        const finalBlob = new Blob(recordedChunksRef.current, { type: mime });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setPreviewUrl(url);
        stopCameraStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          // Stop at 5 minutes safety limit
          if (prev >= 300) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      setCameraError('Failed to initialize video recording engine.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordedBlob(null);
    setRecordingSeconds(0);
    startCameraStream();
  };

  // File Upload Ingest
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setRecordedBlob(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Try to get video duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setRecordingSeconds(Math.round(tempVideo.duration) || 30);
    };

    if (!entryTitle) {
      setEntryTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Save Video to IndexedDB
  const handleSaveToVault = async () => {
    if (!recordedBlob) return;

    setIsSaving(true);
    try {
      const record: StoredVideoRecord = {
        id: `vid-${Date.now()}`,
        date: entryDate,
        title: entryTitle.trim() || `Daily Reflection — ${entryDate}`,
        notes: entryNotes.trim(),
        durationSeconds: recordingSeconds || 30,
        blob: recordedBlob,
        createdAt: new Date().toISOString(),
      };

      await saveVideoToVault(record);
      await loadVaultVideos();

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        // Reset form
        setRecordedBlob(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setEntryTitle('');
        setEntryNotes('');
        setRecordingSeconds(0);
      }, 1500);
    } catch (err) {
      console.error('Failed to save video:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this progress video?')) return;
    try {
      await deleteVideoFromVault(id);
      if (selectedVideoToPlay?.id === id) {
        setSelectedVideoToPlay(null);
      }
      await loadVaultVideos();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-400 uppercase">
            <Video className="w-3.5 h-3.5 text-amber-400" />
            <span>Visual Accountability Vault</span>
            <span aria-hidden="true">·</span>
            <span>Record Everyday</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100 font-display">
            Daily Progress Video & Self-Audit
          </h1>

          <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
            Record a 60–120 second video of yourself every day. Speak honestly without editing. Look yourself in the eye, confront today’s compromises, state tomorrow’s mission, and witness your transformation across days and months.
          </p>

          {/* Quick reflection prompts */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Daily Prompts:</span>
            <span className="text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
              1. Did my actions match who I want to be today?
            </span>
            <span className="text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
              2. What did I avoid?
            </span>
            <span className="text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
              3. Tomorrow's one non-negotiable
            </span>
          </div>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Studio / Recorder Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Recorder Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            {/* Mode Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIngestMode('record');
                    if (!isCameraActive && !previewUrl) startCameraStream();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    ingestMode === 'record'
                      ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Record from Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIngestMode('upload');
                    stopCameraStream();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    ingestMode === 'upload'
                      ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video File</span>
                </button>
              </div>

              {/* Date Badge */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{cameraError}</span>
                  <button
                    onClick={() => setIngestMode('upload')}
                    className="block mt-1 font-semibold underline text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Switch to Video File Upload →
                  </button>
                </div>
              </div>
            )}

            {/* Viewport Box */}
            <div className="relative aspect-video rounded-xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center">
              {/* State A: Preview Recorded Video */}
              {previewUrl ? (
                <div className="w-full h-full relative group">
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-400">
                    Recorded: {formatSeconds(recordingSeconds)}
                  </div>
                </div>
              ) : ingestMode === 'record' ? (
                /* State B: Live Camera Stream */
                isCameraActive ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror scale-x-[-1]"
                    />

                    {/* Recording HUD Overlay */}
                    {isRecording ? (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-950/90 border border-red-700/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono font-bold text-red-200 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>REC · {formatSeconds(recordingSeconds)}</span>
                      </div>
                    ) : (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-neutral-950/80 border border-neutral-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-neutral-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Camera Ready</span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                      <span className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-[11px] text-neutral-300 font-mono">
                        Look directly into the lens. Speak the unvarnished truth.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Camera Off State */
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-neutral-200">
                        Camera is currently inactive
                      </h3>
                      <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                        Turn on your camera to record today’s 60-second video check-in.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCameraStream}
                      className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Enable Camera & Microphone
                    </button>
                  </div>
                )
              ) : (
                /* State C: File Upload Drag Area */
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-neutral-200">
                      Select or drop your daily progress video
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Supports MP4, WebM, MOV files recorded on phone or external camera.
                    </p>
                  </div>
                  <label className="inline-block px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer">
                    Browse Video File
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Recorder Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {previewUrl ? (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Video</span>
                  </button>
                ) : isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors"
                  >
                    Turn off camera
                  </button>
                ) : null}
              </div>

              {/* Record / Stop Button */}
              {ingestMode === 'record' && isCameraActive && !previewUrl && (
                <div>
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop & Review ({formatSeconds(recordingSeconds)})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full bg-white" />
                      <span>Start Recording</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Video Metadata & Save Vault Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-neutral-100 uppercase font-mono tracking-wide">
                Video Check-in Details
              </h2>
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Saved to Vault
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Title / Focus of Today’s Video
                </label>
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="e.g. Day 14: Overcoming Resistance"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Key Observations & Honesty Notes (Optional)
                </label>
                <textarea
                  rows={4}
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="What was my posture? Did I look alert or fatigued? What did I commit to accomplishing tomorrow?"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2 font-mono text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>Recording Date:</span>
                  <span className="text-neutral-200 font-bold">{entryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-neutral-200 font-bold">{formatSeconds(recordingSeconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Engine:</span>
                  <span className="text-emerald-400">IndexedDB Sovereign Vault</span>
                </div>
              </div>

              {/* Save CTA */}
              <button
                type="button"
                disabled={!recordedBlob || isSaving}
                onClick={handleSaveToVault}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  recordedBlob && !isSaving
                    ? 'bg-neutral-100 hover:bg-white text-neutral-950 shadow-lg'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Video to Vault...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Film className="w-3.5 h-3.5" />
                    <span>Save Video To Daily Vault</span>
                  </>
                )}
              </button>

              {!recordedBlob && (
                <p className="text-[11px] text-neutral-500 text-center">
                  Record or upload a video above before saving.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Gallery / Timeline Archive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-100 font-display">
              My Video Progress Vault
            </h2>
            <p className="text-xs text-neutral-400">
              Chronological visual log of your daily check-ins. Watch yourself evolve over weeks and months.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
            {videos.length} {videos.length === 1 ? 'Video' : 'Videos'} Recorded
          </span>
        </div>

        {isLoadingVideos ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            Loading video vault records...
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
            <Film className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-300">No videos recorded yet</h3>
            <p className="text-xs text-neutral-500">
              Start your video log above to build your daily visual archive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((vid) => {
              const videoBlobUrl = URL.createObjectURL(vid.blob);
              return (
                <div
                  key={vid.id}
                  className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden flex flex-col hover:border-neutral-700 transition-colors group"
                >
                  {/* Video Viewport / Playback */}
                  <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                    <video
                      src={videoBlobUrl}
                      preload="metadata"
                      controls
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400">
                      {vid.date}
                    </div>
                    <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800/80 px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300">
                      {formatSeconds(vid.durationSeconds)}
                    </div>
                  </div>

                  {/* Meta & Notes */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {vid.title}
                      </h4>
                      {vid.notes && (
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {vid.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-800/70 flex items-center justify-between text-xs">
                      <a
                        href={videoBlobUrl}
                        download={`reset-progress-${vid.date}.webm`}
                        className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title="Download Video File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Download</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
