'use client'

import { useState, useRef, ChangeEvent } from 'react'
import type { BlogFormData } from '../types/blog'

interface BlogEditorProps {
  initialData?: Partial<BlogFormData>
  onSave: (data: BlogFormData) => Promise<void>
  onCancel: () => void
}

export default function BlogEditor({ initialData, onSave, onCancel }: BlogEditorProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || 'draft',
    tags: initialData?.tags || [],
    metaDescription: initialData?.metaDescription || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'title' && !initialData?.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const newText = `${before}${selectedText}${after}`
    
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end)
    
    setFormData(prev => ({ ...prev, content: newContent }))
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          required
          value={formData.slug}
          onChange={handleInputChange}
          pattern="[a-z0-9-]+"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        <p className="mt-1 text-sm text-gray-500">URL-friendly version of the title</p>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          value={formData.excerpt}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        <p className="mt-1 text-sm text-gray-500">Brief description of the post</p>
      </div>

      <div>
        <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
          Featured Image URL
        </label>
        <input
          type="text"
          id="featuredImage"
          name="featuredImage"
          value={formData.featuredImage}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        
        <div className="border border-gray-300 rounded-md">
          <div className="flex items-center space-x-2 p-2 border-b border-gray-300 bg-gray-50">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="px-3 py-1 text-sm font-bold bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="px-3 py-1 text-sm italic bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('# ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Numbered List"
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](url)')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Link"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('![alt text](', ')')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Image"
            >
              Image
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="px-3 py-1 text-sm font-mono bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Inline Code"
            >
              {'</>'}
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Code Block"
            >
              Code Block
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
              title="Quote"
            >
              Quote
            </button>
          </div>
          
          <textarea
            ref={contentRef}
            id="content"
            name="content"
            required
            rows={20}
            value={formData.content}
            onChange={handleInputChange}
            className="w-full p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write your content in Markdown..."
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">Supports Markdown formatting</p>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags?.join(', ')}
          onChange={handleTagsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="technology, programming, web development"
        />
        <p className="mt-1 text-sm text-gray-500">Comma-separated list of tags</p>
      </div>

      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          name="metaDescription"
          rows={2}
          value={formData.metaDescription}
          onChange={handleInputChange}
          maxLength={160}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="SEO description (max 160 characters)"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.metaDescription?.length || 0}/160 characters
        </p>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  )
}