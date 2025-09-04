'use client'

import { useState } from 'react'
import BlogEditor from './BlogEditor'
import ImageUploader from './ImageUploader'
import type { BlogFormData } from '../types/blog'

interface EnhancedBlogEditorProps {
  initialData?: Partial<BlogFormData>
  onSave: (data: BlogFormData) => Promise<void>
  onCancel: () => void
}

export default function EnhancedBlogEditor({ initialData, onSave, onCancel }: EnhancedBlogEditorProps) {
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [formData, setFormData] = useState<BlogFormData>(initialData as BlogFormData || {
    title: '',
    slug: '',
    content: '',
    status: 'draft'
  })

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, featuredImage: url }))
    setShowImageUploader(false)
  }

  const handleSave = async (data: BlogFormData) => {
    await onSave({ ...data, featuredImage: formData.featuredImage })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {initialData ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>

        {showImageUploader && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Featured Image</h3>
              <button
                onClick={() => setShowImageUploader(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ImageUploader 
              onUpload={handleImageUpload}
              currentImage={formData.featuredImage}
            />
          </div>
        )}

        {!showImageUploader && formData.featuredImage && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="relative inline-block">
              <img
                src={formData.featuredImage}
                alt="Featured"
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={() => setShowImageUploader(true)}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {!showImageUploader && !formData.featuredImage && (
          <div className="mb-6">
            <button
              onClick={() => setShowImageUploader(true)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              Add Featured Image
            </button>
          </div>
        )}

        <BlogEditor
          initialData={{ ...initialData, featuredImage: formData.featuredImage }}
          onSave={handleSave}
          onCancel={onCancel}
        />
      </div>
    </div>
  )
}