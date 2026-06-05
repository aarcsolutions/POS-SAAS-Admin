'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Link2, Upload, Plus, X } from 'lucide-react';
import { Card, Inp } from './FormUI';
import { ProductFormData } from './types';

interface Props {
  data: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
}

export default function Step3Media({ data, onChange }: Props) {
  const [newUrlImage, setNewUrlImage] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const addUrlImage = () => {
    if (!newUrlImage.trim()) return;
    onChange('urlImages', [...data.urlImages, newUrlImage.trim()]);
    setNewUrlImage('');
  };

  const removeUrlImage = (i: number) => {
    onChange('urlImages', data.urlImages.filter((_, idx) => idx !== i));
  };

  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) return;
    onChange('videoUrls', [...data.videoUrls, newVideoUrl.trim()]);
    setNewVideoUrl('');
  };

  const removeVideoUrl = (i: number) => {
    onChange('videoUrls', data.videoUrls.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-5">
      <Card icon={ImageIcon} title="Gallery Images (up to 10)">
        <p className="mb-3 text-sm text-slate-500">Upload product images. The starred image will be the featured/primary image.</p>
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <Upload className="mb-3 h-10 w-10 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-800">Click to upload or drag & drop images</p>
          <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP up to 5MB each · Max 10 images</p>
          <button className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <Upload className="h-4 w-4" /> Choose Files
          </button>
        </div>
      </Card>

      <Card icon={Link2} title="URL Images">
        <div className="flex gap-2">
          <Inp type="text" value={newUrlImage} onChange={(e) => setNewUrlImage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addUrlImage(); }} placeholder="https://example.com/image.jpg" />
          <button onClick={addUrlImage} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Add Image
          </button>
        </div>
        {data.urlImages.length === 0 && <p className="mt-2 text-xs text-slate-400">No images added yet. Add image URLs above.</p>}
        {data.urlImages.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.urlImages.map((url, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                <span className="text-sm text-slate-800 truncate max-w-[500px]">{url}</span>
                <button onClick={() => removeUrlImage(i)} className="rounded-lg p-1 text-slate-400 hover:text-rose-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card icon={Video} title="Product Videos">
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <Video className="mb-3 h-10 w-10 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-800">Click to upload video</p>
          <p className="mt-1 text-xs text-slate-400">MP4, MOV, AVI up to 100MB</p>
          <button className="mt-3 flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            <Upload className="h-4 w-4" /> Upload Video
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <Inp type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addVideoUrl(); }} placeholder="Or paste video URL (YouTube, Vimeo, direct link)" />
          <button onClick={addVideoUrl} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Add URL
          </button>
        </div>
        {data.videoUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.videoUrls.map((url, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                <span className="text-sm text-slate-800 truncate max-w-[500px]">{url}</span>
                <button onClick={() => removeVideoUrl(i)} className="rounded-lg p-1 text-slate-400 hover:text-rose-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
