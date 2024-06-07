import * as React from 'react';

import { TextField } from 'src/components/TextField';

export interface Props {
  formState: {
    companyName: string;
    customerName: string;
    emailDomains: string;
    publicInfo: string;
    useCase: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

export const SupportTicketSMTPFields = (props: Props) => {
  const { formState, handleChange } = props;

  return (
    <React.Fragment>
      <TextField
        data-qa-ticket-customer-name
        label={SMTP_FIELD_NAME_TO_LABEL_MAP.customerName}
        name="customerName"
        onChange={handleChange}
        required
        value={formState.customerName}
      />
      <TextField
        data-qa-ticket-company-name
        label={SMTP_FIELD_NAME_TO_LABEL_MAP.companyName}
        name="companyName"
        onChange={handleChange}
        value={formState.companyName}
      />
      <TextField
        data-qa-ticket-use-case
        expand
        label={SMTP_FIELD_NAME_TO_LABEL_MAP.useCase}
        multiline
        name="useCase"
        onChange={handleChange}
        required
        value={formState.useCase}
      />
      <TextField
        data-qa-ticket-email-domains
        expand
        label={SMTP_FIELD_NAME_TO_LABEL_MAP.emailDomains}
        multiline
        name="emailDomains"
        onChange={handleChange}
        required
        value={formState.emailDomains}
      />
      <TextField
        data-qa-ticket-public-info
        expand
        label={SMTP_FIELD_NAME_TO_LABEL_MAP.publicInfo}
        multiline
        name="publicInfo"
        onChange={handleChange}
        required
        value={formState.publicInfo}
      />
    </React.Fragment>
  );
};
