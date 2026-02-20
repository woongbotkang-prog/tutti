'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GigImageUploadProps {
  images: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  maxSizeMB?: number
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function GigImageUpload({
  images,
  onChange,
  maxImages = 3,
  maxSizeMB = 5,
}: GigImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)

    const remaining = maxImages - images.length
    if (remaining <= 0) {
      setError(`최대 ${maxImages}장까지 업로드할 수 있습니다.`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)

    // Validate each file
    for (const file of filesToUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('JPG, PNG, WebP 형식만 업로드할 수 있어요.')
        return
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`파일 크기는 ${maxSizeMB}MB 이하만 가능해요.`)
        return
      }
    }

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const newUrls: string[] = []

      for (const file of filesToUpload) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('gig-images')
          .upload(fileName, file, { upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('gig-images')
          .getPublicUrl(fileName)

        newUrls.push(urlData.publicUrl)
      }

      onChange([...images, ...newUrls])
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      setError('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">사진 첨부</p>
          <p className="text-xs text-gray-400">최대 {maxImages}장, 장당 {maxSizeMB}MB</p>
        </div>
        <span className="text-xs text-gray-400">{images.length}/{maxImages}</span>
      </div>

      {/* 저작권·초상권 경고 */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
        <p className="text-xs text-amber-800 leading-relaxed">
          ⚠️ 업로드하는 사진의 저작권과 초상권에 대한 법적 책임은 게시자에게 있습니다. 타인의 초상, 악보, 저작물이 포함된 사진은 권리자의 동의 없이 업로드할 수 없습니다.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <div key={idx} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt={`공고 사진 ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼 */}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              업로드 중...
            </span>
          ) : (
            '+ 사진 추가'
          )}
        </button>
      )}

      <p className="text-[10px] text-gray-400">
        자세한 사항은 <a href="/terms" className="underline hover:text-gray-600">이용약관 제7조</a>를 참고해 주세요.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
