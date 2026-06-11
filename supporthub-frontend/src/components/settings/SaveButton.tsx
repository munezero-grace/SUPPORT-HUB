import React from 'react'
import { Button } from '../ui/Button'

interface SaveButtonProps {
  isLoading?: boolean
  disabled?: boolean
  label?: string
  loadingLabel?: string
}

const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading = false,
  disabled = false,
  label = 'Save Changes',
  loadingLabel = 'Saving...',
}) => {
  return (
    <div className="pt-4">
      <Button
        disabled={disabled || isLoading}
        className={`
              px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-900 hover:cursor-pointer hover:bg-gray-800
          ${
            disabled || isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : ' text-white hover:bg-gray-800'
          }
        `}
        type="submit"
      >
        {isLoading ? loadingLabel : label}
      </Button>
    </div>
  )
}

export default SaveButton
