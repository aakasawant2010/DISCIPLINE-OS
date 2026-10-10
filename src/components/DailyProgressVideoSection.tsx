import React, { useState, useEffect, useRef } from 'react';
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
  Film, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  saveVideoToVault, 
  getAllVideosFromVault, 
  deleteVideoFromVault, 
  StoredVideoRecord 
} from '../utils/videoStorage';

interface DailyProgressVideoSectionProps {
  selectedDate: string;
}

export const DailyProgressVideoSection: React.FC<DailyProgressVideoSectionProps> = ({ selectedDate }) => {
  const [videos, setVideos] = useState<StoredVideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activePlaybackUrl, setActivePlaybackUrl] = useState<string | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const cameraStreamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const activePlaybackUrlRef = useRef<string | null>(null);

  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    activePlaybackUrlRef.current = activePlaybackUrl;
  }, [activePlaybackUrl]);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const list = await getAllVideosFromVault();
      setVideos(list);
    } catch (e) {
      console.error('Error loading videos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [todayVideoUrl, setTodayVideoUrl] = useState<string | null>(null);

  const todayVideo = videos.find((v) => v.date === selectedDate);

  // Sync today's video object URL without recreating on every render
  useEffect(() => {
    if (todayVideo?.blob) {
      const url = URL.createObjectURL(todayVideo.blob);
      setTodayVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setTodayVideoUrl(null);
    }
  }, [todayVideo?.id]);

  // Ensure camera stream is attached when live video ref mounts
  useEffect(() => {
    if (isCameraActive && cameraStream && liveVideoRef.current) {
      liveVideoRef.current.srcObject = cameraStream;
      liveVideoRef.current.play().catch((err) => {
        console.warn('Video play warning:', err);
      });
    }
  }, [isCameraActive, cameraStream]);

  // Release camera stream and object URLs strictly on component unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (activePlaybackUrlRef.current) URL.revokeObjectURL(activePlaybackUrlRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera or microphone. Check browser permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    try {
      const recorder = new MediaRecorder(cameraStream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setPreviewUrl(url);
      };

      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setCameraError('Failed to start recorder: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordedBlob(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (!entryTitle) setEntryTitle(file.name.replace(/\.[^/.]+$/, ''));
    setRecordingSeconds(60);
  };

  const handleSaveVideo = async () => {
    if (!recordedBlob) return;
    setIsSaving(true);
    try {
      const newRecord: StoredVideoRecord = {
        id: `vid-${Date.now()}`,
        date: selectedDate,
        title: entryTitle.trim() || `Daily Progress Check-in (${selectedDate})`,
        notes: entryNotes.trim(),
        durationSeconds: Math.max(1, recordingSeconds),
        blob: recordedBlob,
        createdAt: new Date().toISOString(),
      };

      await saveVideoToVault(newRecord);
      stopCamera();
      setRecordedBlob(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setEntryTitle('');
      setEntryNotes('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadVideos();
    } catch (err: any) {
      setCameraError('Error saving video: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteAction = async (id: string) => {
    try {
      await deleteVideoFromVault(id);
      setConfirmDeleteId(null);
      await loadVideos();
    } catch (err: any) {
      setCameraError('Failed to delete video: ' + err.message);
    }
  };

  const playRecordedVideo = (vid: StoredVideoRecord) => {
    if (activePlaybackUrl) URL.revokeObjectURL(activePlaybackUrl);
    const url = URL.createObjectURL(vid.blob);
    setActivePlaybackUrl(url);
  };

  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
                Daily Progress Video Vault
              </h2>
              {todayVideo ? (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  Logged for {selectedDate}
                </span>
              ) : (
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/80 px-2 py-0.5 rounded">
                  Pending Check-in
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Record a 60–120 second unedited check-in. Look yourself in the eye, speak truth, and capture genuine evolution.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Check className="w-4 h-4" /> Video saved to vault!
          </span>
        )}
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/80 text-xs text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={() => setCameraError(null)}
            className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Today's Video Player (if already logged) */}
      {todayVideo && !isCameraActive && !previewUrl && (
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-neutral-200">{todayVideo.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.floor(todayVideo.durationSeconds / 60)}m {todayVideo.durationSeconds % 60}s</span>
            </div>
          </div>

          {(activePlaybackUrl || todayVideoUrl) && (
            <video
              src={activePlaybackUrl || todayVideoUrl || undefined}
              controls
              className="w-full max-h-72 rounded-lg bg-black border border-neutral-800 object-contain"
            />
          )}

          {todayVideo.notes && (
            <p className="text-xs text-neutral-300 italic">"{todayVideo.notes}"</p>
          )}

          <div className="flex items-center justify-between pt-1">
            {confirmDeleteId === todayVideo.id ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-rose-400">Permanently delete?</span>
                <button
                  onClick={() => confirmDeleteAction(todayVideo.id)}
                  className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-100 rounded text-xs font-bold cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleDelete(todayVideo.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete & Re-record
              </button>
            )}
            <button
              onClick={startCamera}
              className="text-xs text-neutral-300 hover:text-white underline cursor-pointer"
            >
              Record Another Entry
            </button>
          </div>
        </div>
      )}

      {/* In-Page Camera Recorder & Preview */}
      {(!todayVideo || isCameraActive || previewUrl) && (
        <div className="space-y-4">
          <div className="relative aspect-video max-h-80 w-full rounded-xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
            {previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : isCameraActive ? (
              <>
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800 text-xs font-mono text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>REC</span>
                    <span className="tabular-nums">
                      {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  Camera inactive. Click to initialize camera for today's check-in.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Webcam</span>
                  </button>
                  <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Recorder Controls */}
          {isCameraActive && !previewUrl && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Square className="w-3 h-3 fill-neutral-950" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              <button
                onClick={stopCamera}
                className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Close Camera
              </button>
            </div>
          )}

          {/* Save Preview Form */}
          {previewUrl && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Video title (e.g. Day 42 - Breakthrough on resistance)..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                />
                <input
                  type="text"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="Optional brief notes or key takeaway..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setRecordedBlob(null);
                    startCamera();
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-record
                </button>

                <button
                  onClick={handleSaveVideo}
                  disabled={isSaving}
                  className="px-5 py-2 bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Vault...' : 'Save Video to Vault'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Vault Archives Drawer */}
      {videos.length > 0 && (
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Video History ({videos.length} logged)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {videos.map((vid) => (
              <button
                key={vid.id}
                onClick={() => playRecordedVideo(vid)}
                className="shrink-0 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left space-y-1 transition-colors cursor-pointer max-w-[180px]"
              >
                <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {vid.date}
                </div>
                <div className="text-xs font-semibold text-neutral-200 truncate">
                  {vid.title}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {Math.floor(vid.durationSeconds / 60)}m {vid.durationSeconds % 60}s
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
