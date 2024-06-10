import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TextField } from 'src/components/TextField';
import { useAccount } from 'src/queries/account/account';

export interface SMTPCustomFields {
  companyName: string;
  customerName: string;
  emailDomains: string;
  publicInfo: string;
  useCase: string;
}

export const SMTP_FIELD_NAME_TO_LABEL_MAP: Record<string, string> = {
  companyName: 'Business or company name',
  customerName: 'First and last name',
  emailDomains: 'Domain(s) that will be sending emails',
  publicInfo:
    "Links to public information - e.g. your business or application's website, Twitter profile, GitHub, etc.",
  useCase:
    "A clear and detailed description of your email use case, including how you'll avoid sending unwanted emails",
};

export const SupportTicketSMTPFields = () => {
  const form = useFormContext();
  const { data: account } = useAccount();

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
