import React, { useState, useEffect } from 'react';
import { Upload, Video, CheckCircle2, Film, Clock, ExternalLink, Play } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import VideoPlayer from '../../components/video/VideoPlayer';

export default function VideoUploaderPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(180);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const { triggerToastAlert } = useNotifications();

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos');
      if (res.data.success) {
        setVideos(res.data.videos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      triggerToastAlert('Please select a video file to upload', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('duration', duration);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.success) {
        triggerToastAlert('Video uploaded and cataloged in Cloud storage!', 'info');
        setFile(null);
        setTitle('');
        setUploadProgress(0);
        fetchVideos();
      }
    } catch (err) {
      triggerToastAlert('Upload failed. Check format or size.', 'critical');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Video Media Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload video modules to Cloudinary/S3-compliant streaming storage. Metadata and streaming URLs are cataloged in MongoDB.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Box */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-black" />
            Upload New Video
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Drag & drop box */}
            <div className="relative border-2 border-dashed border-gray-300 hover:border-black rounded-2xl p-6 text-center transition-colors cursor-pointer bg-gray-50">
              <input
                type="file"
                accept="video/mp4,video/webm,video/mkv,video/mov"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Video className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-gray-900">{file.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-gray-900">Click or drag MP4 video here</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">MP4, WebM, MKV up to 500MB</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Components & Hooks Architecture"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Duration (Seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-700 font-mono">
                  <span>Uploading to Cloud...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Streaming & Indexing...' : 'Upload Video File'}
            </button>
          </form>
        </div>

        {/* Video Catalog List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Cataloged Videos</h3>
            <span className="text-xs text-gray-500 font-mono">{videos.length} Files</span>
          </div>

          {previewVideo && (
            <div className="p-4 rounded-3xl bg-white border border-gray-300 shadow-md space-y-2">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-gray-900">Stream Preview: {previewVideo.title}</span>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="text-xs text-gray-500 hover:text-black font-bold"
                >
                  Close Preview
                </button>
              </div>
              <VideoPlayer src={previewVideo.url} title={previewVideo.title} />
            </div>
          )}

          <div className="space-y-3">
            {videos.map((vid) => (
              <div
                key={vid._id}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{vid.title}</h4>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      URL: {vid.url} • {vid.duration}s • {vid.storageProvider}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewVideo(vid)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Preview Stream
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
