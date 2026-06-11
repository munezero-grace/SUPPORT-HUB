import React from 'react'
import { AdvancedProps } from '@/types/TicketTypes'

function Advanced({ formData, handleInputChange, isAdmin }: AdvancedProps) {
    const handleTagsInput = (value: string) => {
        handleInputChange('tags', value);
    };
    const displayTags = (tags: string) => {
        if (!tags) return [];
        return tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    };
    return (
        <div className={`space-y-6 ${!isAdmin ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative">
                {!isAdmin && (
                    <div className="absolute inset-0 z-10 bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center">
                        <p className="text-sm text-gray-500">Advanced features are only available for administrators</p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                </label>
                <input
                    type="text"
                    placeholder="bug, login, authentication"
                    value={formData.tags}
                    onChange={(e) => handleTagsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />                {formData.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {displayTags(formData.tags).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (Optional)
                </label>
                <input
                    type="date"
                    value={formData.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time (hours)
                </label>
                <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.estimatedTime}
                    onChange={(e) =>
                        handleInputChange('estimatedTime', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                </label>
                <textarea
                    placeholder="Notes visible only to internal team"
                    value={formData.internalNotes}
                    onChange={(e) =>
                        handleInputChange('internalNotes', e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                />
            </div>
        </div>
    )
}

export default Advanced