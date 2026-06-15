import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { AvatarIcon } from '@/components/icons'
import { ProfilePictureUploadProps } from '@/types/interfaces/Settings'
import { uploadProfilePicture } from '@/services/settings.service'

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  profilePicture,
  onPhotoChange,
}) => {
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profilePicture || null)
  const [uploading, setUploading] = useState(false)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    try {
      setUploading(true)
      const result = await uploadProfilePicture(file)
      const imageUrl: string = result.data.profilePicture
      URL.revokeObjectURL(localUrl)
      setPreviewUrl(imageUrl)
      await update({ image: imageUrl })
      onPhotoChange?.(imageUrl)
      toast.success('Profile photo updated')
    } catch {
      toast.error('Failed to upload photo')
      URL.revokeObjectURL(localUrl)
      setPreviewUrl(profilePicture || null)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const displayUrl = previewUrl || profilePicture || null

  return (
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full object-cover"
            unoptimized={displayUrl.startsWith('blob:')}
          />
        ) : (
          <AvatarIcon className="h-8 w-8 text-gray-500" />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={handlePhotoClick}
        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>
    </div>
  )
}

export default ProfilePictureUpload
