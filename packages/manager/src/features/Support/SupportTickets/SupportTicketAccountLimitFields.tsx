import * as React from 'react';

import { TextField } from 'src/components/TextField';

// TODO: look into changing over to RHF
export interface Props {
  formState?: {
    companyName: string;
    customerName: string;
    linodePlan: string;
    numberOfLinodes: string;
    useCase: string;
  };
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ACCOUNT_LIMIT_DIALOG_TITLE =
  'Contact Support: Account Limit Increase';
export const ACCOUNT_LIMIT_HELPER_TEXT =
  'To request access to more Linodes, LKE nodes, and/or larger plans, please provide us with the following information. Typically, we require a few months of positive billing history on an account before we will consider an account limit increase.';

// TODO: consider extending this from a base type to DRY this up
const fieldNameToLabelMap: Record<string, string> = {
  companyName: 'Business or company name',
  customerName: 'First and last name',
  linodePlan: 'Which Linode plan do you need access to?',
  numberOfLinodes: 'Total number of Linodes you need?',
  useCase:
    'A detailed description of your use case and why you need access to more/larger Linodes',
};

export const SupportTicketAccountLimitFields = (props: Props) => {
  const { formState, handleChange } = props;

  return (
    <>
      <TextField
        label={fieldNameToLabelMap.customerName}
        name="customerName"
        onChange={handleChange}
        required
        value={formState?.customerName}
      />
      <TextField
        label={fieldNameToLabelMap.companyName}
        name="companyName"
        onChange={handleChange}
        value={formState?.companyName}
      />
      <TextField
        label={fieldNameToLabelMap.numberOfLinodes}
        onChange={handleChange}
        value={formState?.numberOfLinodes}
      />{' '}
      <TextField
        label={fieldNameToLabelMap.linodePlan}
        onChange={handleChange}
        value={formState?.linodePlan}
      />
      <TextField
        expand
        label={fieldNameToLabelMap.useCase}
        multiline
        name="useCase"
        onChange={handleChange}
        required
        value={formState?.useCase}
      />
    </>
  );
};
