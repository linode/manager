import * as React from 'react';
import TextField from 'src/components/TextField';

export interface Props {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formState: {
    customerName: string;
    companyName: string;
    useCase: string;
    emailDomains: string;
    publicInfo: string;
  };
}

export const smtpDialogTitle = 'Contact Support: SMTP Restriction Removal';
export const smtpHelperText =
  'In an effort to fight spam, outbound connections are restricted on ports 25, 465, and 587. To have these restrictions removed, please provide us with the following information. A member of the Support team will review your request and follow up with you as soon as possible.';

export const fieldNameToLabelMap: Record<string, string> = {
  customerName: 'First and last name',
  companyName: 'Business or company name',
  useCase:
    "A clear and detailed description of your email use case, including how you'll avoid sending unwanted emails",
  emailDomains: 'Domain(s) that will be sending emails',
  publicInfo:
    "Links to public information - e.g. your business or application's website, Twitter profile, GitHub, etc.",
};

const SupportTicketSMTPFields: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { handleChange, formState } = props;

  return (
    <React.Fragment>
      <TextField
        label={fieldNameToLabelMap.customerName}
        required
        name="customerName"
        value={formState.customerName}
        onChange={handleChange}
        data-qa-ticket-customer-name
      />
      <TextField
        label={fieldNameToLabelMap.companyName}
        name="companyName"
        value={formState.companyName}
        onChange={handleChange}
        data-qa-ticket-company-name
      />
      <TextField
        label={fieldNameToLabelMap.useCase}
        required
        expand
        multiline
        name="useCase"
        value={formState.useCase}
        onChange={handleChange}
        data-qa-ticket-use-case
      />
      <TextField
        label={fieldNameToLabelMap.emailDomains}
        required
        expand
        multiline
        name="emailDomains"
        value={formState.emailDomains}
        onChange={handleChange}
        data-qa-ticket-email-domains
      />
      <TextField
        label={fieldNameToLabelMap.publicInfo}
        required
        expand
        multiline
        name="publicInfo"
        value={formState.publicInfo}
        onChange={handleChange}
        data-qa-ticket-public-info
      />
    </React.Fragment>
  );
};

export default SupportTicketSMTPFields;
