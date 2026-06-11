import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TableProps } from '@/types/interfaces/Props'

export function Table<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  className,
  emptyState,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-x-auto rounded-lg shadow">
          <div className="inline-block min-w-full">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={cn(
                        'py-3.5 px-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap truncate',
                        column.className
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      onRowClick && 'cursor-pointer',
                      'truncate'
                    )}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="menu"]') || target.closest('button')) {
                        return;
                      }
                      onRowClick?.(item);
                    }}
                  >
                    {columns.map((column, colIndex) => {
                      const content = typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : item[column.accessor as keyof T]

                      return (
                        <td
                          key={colIndex}
                          className={cn(
                            'py-4 px-3 text-sm text-gray-900',
                            !column.wrap && 'whitespace-nowrap',
                            column.className
                          )}
                        >
                          <div className={cn('w-full', !column.wrap && 'truncate')}>
                            {content as ReactNode}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
