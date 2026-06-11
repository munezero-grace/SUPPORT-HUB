import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/Dialog';
import { Form, FormField } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { productValidationSchema } from '@/types/interfaces/product';
import { FormEvent, useEffect } from 'react';
import { ProductFormModalProps } from '@/types/interfaces/Props';
import { STATUS_OPTIONS } from '@/constants/productConfig';

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}: ProductFormModalProps) {
  const form = useForm({
    resolver: zodResolver(productValidationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
      });
    } else if (!initialData) {
      form.reset({
        name: '',
        description: '',
        status: 'active',
      });
    }
  }, [isOpen, initialData, form]);

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
      });
    }
  }, [isOpen, initialData, form]);

  const currentStatus = form.watch('status');
  const selectedOption = STATUS_OPTIONS.find(option => option.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
        form.reset();
      }}
      title={title}
    >
      <Form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          void form.handleSubmit((formData) => {
            onSubmit(formData);
            onClose();
            form.reset();
          })(e);
        }}
      >
        <div className="space-y-4">
          <FormField
            label="Product Name"
            error={form.formState.errors.name?.message}
            required
          >
            <Input
              {...form.register('name')}
              placeholder="Enter product name"
              className="w-full"
            />
          </FormField>

          <FormField
            label="Description"
            error={form.formState.errors.description?.message}
            required
          >
            <textarea
              {...form.register('description')}
              className="w-full min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
          </FormField>

          <FormField
            label="Status"
            error={form.formState.errors.status?.message}
            required
          >
            <Select
              value={selectedOption}
              onChange={(option) => {
                if (option.value === 'active' || option.value === 'inactive') {
                  form.setValue('status', option.value);
                }
              }}
              options={STATUS_OPTIONS}
              className="w-full"
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              form.reset();
            }}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
