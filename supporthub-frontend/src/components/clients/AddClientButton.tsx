import { useState } from 'react'
import { AddClientModal } from './AddClientModal'

export function AddClientButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)


  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors"
        aria-label="Add Client"
      >
        <span className="text-xl font-bold text-gray-300 mr-2">+</span>
        <span className="font-medium">Add Client</span>
      </button>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
