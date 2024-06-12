import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TextField } from 'src/components/TextField';
import { useAccount } from 'src/queries/account/account';

import { SMTP_FIELD_NAME_TO_LABEL_MAP } from './constants';

import type { CustomFields } from './constants';
import type { SupportTicketFormFields } from './SupportTicketDialog';

export interface SMTPCustomFields extends CustomFields {
  emailDomains: string;
}

export const SupportTicketSMTPFields = () => {
  const form = useFormContext<SMTPCustomFields & SupportTicketFormFields>();
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
        render={({ field }) => (
          <TextField
            data-qa-ticket-customer-name
            defaultValue={`${account?.first_name} ${account?.last_name}`}
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
        render={({ field }) => (
          <TextField
            data-qa-ticket-company-name
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
        render={({ field }) => (
          <TextField
            data-qa-ticket-use-case
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
        render={({ field }) => (
          <TextField
            data-qa-ticket-email-domains
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
        render={({ field }) => (
          <TextField
            data-qa-ticket-public-info
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
