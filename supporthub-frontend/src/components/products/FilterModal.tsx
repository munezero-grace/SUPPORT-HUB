import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { PRODUCT_STATUS_OPTIONS } from '@/constants/productConfig';
import { SelectOption } from '@/types/interfaces/Props';
import { ClientsIcon, TicketIcon } from '@/components/icons';
import { useState } from 'react';
import { FilterModalProps, FilterOptions } from '@/types/interfaces/Props';

export type { FilterOptions };

export function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleStatusChange = (value: SelectOption) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleMinClientsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    setFilters(prev => ({ ...prev, minClients: value }));
  };

  const handleMinDevelopersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    setFilters(prev => ({ ...prev, minDevelopers: value }));
  };

  const handleActiveTicketsChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, hasActiveTickets: checked }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleCancel = () => {
    setFilters(initialFilters);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Products"
      className="w-[480px]"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            label="All"
            options={PRODUCT_STATUS_OPTIONS}
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ClientsIcon className="w-4 h-4 text-blue-500" />
              Min. Clients
            </label>
            <Input
              type="number"
              min={0}
              value={filters.minClients || ''}
              onChange={handleMinClientsChange}
              placeholder="Enter number"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ClientsIcon className="w-4 h-4 text-green-500" />
              Min. Developers
            </label>
            <Input
              type="number"
              min={0}
              value={filters.minDevelopers || ''}
              onChange={handleMinDevelopersChange}
              placeholder="Enter number"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={filters.hasActiveTickets || false}
            onCheckedChange={handleActiveTicketsChange}
            id="activeTickets"
          />
          <label
            htmlFor="activeTickets"
            className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
          >
            <TicketIcon className="w-4 h-4 text-purple-500" />
            Has Active Tickets
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </Dialog>
  );
}
