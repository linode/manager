import { TextField } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useAccount } from '@linode/queries';

import { SMTP_FIELD_NAME_TO_LABEL_MAP } from './constants';

import type { CustomFields } from './constants';

export interface SMTPCustomFields extends Omit<CustomFields, 'companyName'> {
  companyName: string | undefined;
  emailDomains: string;
}

export const SupportTicketSMTPFields = () => {
  const form = useFormContext<SMTPCustomFields>();
  const { data: account } = useAccount();

  const defaultValues = {
    companyName: account?.company,
    customerName: `${account?.first_name} ${account?.last_name}`,
    ...form.formState.defaultValues,
  };

  React.useEffect(() => {
    form.reset(defaultValues);
  }, []);

  return (
    <>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-customer-name
            defaultValue={`${account?.first_name} ${account?.last_name}`}
            errorText={fieldState.error?.message}
            label={SMTP_FIELD_NAME_TO_LABEL_MAP.customerName}
            name="customerName"
            onChange={field.onChange}
            required
            value={field.value}
          />
        )}
        control={form.control}
        name="customerName"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-company-name
            errorText={fieldState.error?.message}
            label={SMTP_FIELD_NAME_TO_LABEL_MAP.companyName}
            name="companyName"
            onChange={field.onChange}
            value={field.value}
          />
        )}
        control={form.control}
        name="companyName"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-use-case
            errorText={fieldState.error?.message}
            expand
            label={SMTP_FIELD_NAME_TO_LABEL_MAP.useCase}
            multiline
            name="useCase"
            onChange={field.onChange}
            required
            value={field.value}
          />
        )}
        control={form.control}
        name="useCase"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-email-domains
            errorText={fieldState.error?.message}
            expand
            label={SMTP_FIELD_NAME_TO_LABEL_MAP.emailDomains}
            multiline
            name="emailDomains"
            onChange={field.onChange}
            required
            value={field.value}
          />
        )}
        control={form.control}
        name="emailDomains"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-public-info
            errorText={fieldState.error?.message}
            expand
            label={SMTP_FIELD_NAME_TO_LABEL_MAP.publicInfo}
            multiline
            name="publicInfo"
            onChange={field.onChange}
            required
            value={field.value}
          />
        )}
        control={form.control}
        name="publicInfo"
      />
    </>
  );
};
