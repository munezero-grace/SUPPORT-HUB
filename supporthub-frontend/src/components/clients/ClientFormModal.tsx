'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/Dialog';
import { Form, FormField } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { clientFormSchema, type ClientFormData } from '@/validations/clientSchema';
import { FormEvent, useEffect } from 'react';
import { SupportTier, Status } from '@/types/clients';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClientFormData) => void | Promise<void>;
    initialData?: Partial<ClientFormData>;
    title: string;
}

const STATUS_OPTIONS = [
    { value: Status.Active, label: 'Active' },
    { value: Status.Inactive, label: 'Inactive' },
];

const SUPPORT_TIER_OPTIONS = [
    { value: SupportTier.Standard, label: 'Standard' },
    { value: SupportTier.Premium, label: 'Premium' },
];

export function ClientFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title
}: ClientFormModalProps) {
    const form = useForm({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            companyName: initialData?.companyName || '',
            contactName: initialData?.contactName || '',
            contactEmail: initialData?.contactEmail || '',
            supportTier: initialData?.supportTier || SupportTier.Standard,
            status: initialData?.status || Status.Active,
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            form.reset({
                companyName: initialData.companyName || '',
                contactName: initialData.contactName || '',
                contactEmail: initialData.contactEmail || '',
                supportTier: initialData.supportTier || SupportTier.Standard,
                status: initialData.status || Status.Active,
            });
        } else if (!initialData) {
            form.reset({
                companyName: '',
                contactName: '',
                contactEmail: '',
                supportTier: SupportTier.Standard,
                status: Status.Active,
            });
        }
    }, [isOpen, initialData, form]);

    const currentStatus = form.watch('status');
    const currentSupportTier = form.watch('supportTier');

    const selectedStatusOption = STATUS_OPTIONS.find(option => option.value === currentStatus) || STATUS_OPTIONS[0];
    const selectedSupportTierOption = SUPPORT_TIER_OPTIONS.find(option => option.value === currentSupportTier) || SUPPORT_TIER_OPTIONS[0];

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
                        label="Company Name"
                        error={form.formState.errors.companyName?.message}
                        required
                    >
                        <Input
                            {...form.register('companyName')}
                            placeholder="Enter company name"
                            className="w-full"
                        />
                    </FormField>

                    <FormField
                        label="Contact Name"
                        error={form.formState.errors.contactName?.message}
                        required
                    >
                        <Input
                            {...form.register('contactName')}
                            placeholder="Enter contact name"
                            className="w-full"
                        />
                    </FormField>

                    <FormField
                        label="Contact Email"
                        error={form.formState.errors.contactEmail?.message}
                        required
                    >
                        <Input
                            {...form.register('contactEmail')}
                            type="email"
                            placeholder="Enter contact email"
                            className="w-full"
                        />
                    </FormField>

                    <FormField
                        label="Support Tier"
                        error={form.formState.errors.supportTier?.message}
                        required
                    >
                        <Select
                            value={selectedSupportTierOption}
                            onChange={(option) => {
                                form.setValue('supportTier', option?.value as SupportTier);
                            }}
                            options={SUPPORT_TIER_OPTIONS}
                        />
                    </FormField>

                    <FormField
                        label="Status"
                        error={form.formState.errors.status?.message}
                        required
                    >
                        <Select
                            value={selectedStatusOption}
                            onChange={(option) => {
                                form.setValue('status', option?.value as Status);
                            }}
                            options={STATUS_OPTIONS}
                        />
                    </FormField>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            onClose();
                            form.reset();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        {initialData ? 'Save Changes' : 'Create Client'}
                    </Button>
                </div>
            </Form>
        </Dialog>
    );
}
