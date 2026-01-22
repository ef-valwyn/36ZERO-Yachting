'use client';

import React, { useState, useRef } from 'react';
import type { PutBlobResult } from '@vercel/blob';
import { motion } from 'framer-motion';
import { Upload, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Button, GlassCard } from '@36zero/ui';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

export default function UploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBlob(null);

    if (!inputFileRef.current?.files || !inputFileRef.current.files[0]) {
      setError('Please select a file to upload');
      return;
    }

    const file = inputFileRef.current.files[0];
    setIsUploading(true);

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const newBlob = (await response.json()) as PutBlobResult;
      setBlob(newBlob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (blob?.url) {
      await navigator.clipboard.writeText(blob.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-brand-navy">
      <Header variant="transparent" />

      <div className="min-h-screen flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard variant="blue" padding="lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-brand-blue" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Media Upload</h1>
                <p className="text-white/60 text-sm">
                  Upload images and media files to Vercel Blob storage
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Input */}
                <div>
                  <label 
                    htmlFor="file-upload" 
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Select File
                  </label>
                  <div className="relative">
                    <input
                      id="file-upload"
                      name="file"
                      ref={inputFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
                               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                               file:text-sm file:font-medium file:bg-brand-blue file:text-white
                               hover:file:bg-brand-blue/80 file:cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    Supported: JPEG, PNG, WebP, GIF, MP4, WebM, PDF
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </form>

              {/* Success Result */}
              {blob && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-accent-teal/10 border border-accent-teal/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-accent-teal" />
                    <p className="font-medium text-accent-teal">Upload Successful</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">File URL</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-white/80 bg-white/5 px-3 py-2 rounded-lg overflow-x-auto">
                          {blob.url}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          title="Copy URL"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-accent-teal" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                        <a
                          href={blob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4 text-white/60" />
                        </a>
                      </div>
                    </div>

                    {/* Preview for images */}
                    {blob.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) && (
                      <div>
                        <p className="text-xs text-white/40 mb-2">Preview</p>
                        <img
                          src={blob.url}
                          alt="Uploaded file preview"
                          className="max-w-full h-auto max-h-48 rounded-lg object-contain bg-white/5"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          <p className="text-center text-white/30 text-xs mt-6">
            Files are stored securely in Vercel Blob storage
          </p>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
