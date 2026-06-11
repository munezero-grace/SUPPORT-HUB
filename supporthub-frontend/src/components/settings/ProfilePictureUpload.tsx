import React, { useRef } from 'react'
import Image from 'next/image'
import { AvatarIcon } from '@/components/icons'
import { ProfilePictureUploadProps } from '@/types/interfaces/Settings'

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  profilePicture,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
        {profilePicture ? (
          <Image
            src={profilePicture}
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full object-cover"
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
        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
        type="button"
      >
        Change Photo
      </button>
    </div>
  )
}

export default ProfilePictureUpload
