'use client'

import { useState, useRef, ChangeEvent } from 'react'

interface ImageUploaderProps {
  onUpload: (url: string) => void
  currentImage?: string
}

export default function ImageUploader({ onUpload, currentImage }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || '')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPreview(data.url)
      onUpload(data.url)
    } catch (err) {
      setError('Failed to upload image. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlInput = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      setPreview(url)
      onUpload(url)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
        
        <button
          type="button"
          onClick={handleUrlInput}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Use URL
        </button>

        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview('')
              onUpload('')
            }}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Remove
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg shadow-md"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}
    </div>
  )
}