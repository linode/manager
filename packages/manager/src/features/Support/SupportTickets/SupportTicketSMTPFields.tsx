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

export const smtpDialogTitle = 'Contact Support: SMTP Restriction Removal';
export const smtpHelperText =
  'In an effort to fight spam, outbound connections are restricted on ports 25, 465, and 587. To have these restrictions removed, please provide us with the following information. A member of the Support team will review your request and follow up with you as soon as possible.';

export const fieldNameToLabelMap: Record<string, string> = {
  companyName: 'Business or company name',
  customerName: 'First and last name',
  emailDomains: 'Domain(s) that will be sending emails',
  publicInfo:
    "Links to public information - e.g. your business or application's website, Twitter profile, GitHub, etc.",
  useCase:
    "A clear and detailed description of your email use case, including how you'll avoid sending unwanted emails",
};

const SupportTicketSMTPFields: React.FC<Props> = (props) => {
  const { formState, handleChange } = props;

  return (
    <React.Fragment>
      <TextField
        data-qa-ticket-customer-name
        label={fieldNameToLabelMap.customerName}
        name="customerName"
        onChange={handleChange}
        required
        value={formState.customerName}
      />
      <TextField
        data-qa-ticket-company-name
        label={fieldNameToLabelMap.companyName}
        name="companyName"
        onChange={handleChange}
        value={formState.companyName}
      />
      <TextField
        data-qa-ticket-use-case
        expand
        label={fieldNameToLabelMap.useCase}
        multiline
        name="useCase"
        onChange={handleChange}
        required
        value={formState.useCase}
      />
      <TextField
        data-qa-ticket-email-domains
        expand
        label={fieldNameToLabelMap.emailDomains}
        multiline
        name="emailDomains"
        onChange={handleChange}
        required
        value={formState.emailDomains}
      />
      <TextField
        data-qa-ticket-public-info
        expand
        label={fieldNameToLabelMap.publicInfo}
        multiline
        name="publicInfo"
        onChange={handleChange}
        required
        value={formState.publicInfo}
      />
    </React.Fragment>
  );
};

export default SupportTicketSMTPFields;
