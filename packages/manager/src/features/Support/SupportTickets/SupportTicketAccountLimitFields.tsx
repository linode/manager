import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { TextField } from 'src/components/TextField';
import { useAccount } from 'src/queries/account/account';

import { ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP } from './constants';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';

import type { CustomFields } from './constants';
import type { EntityType } from './SupportTicketDialog';

export interface AccountLimitCustomFields extends CustomFields {
  linodePlan: string;
  numberOfEntities: string;
}

interface Props {
  entityType: EntityType;
}

export const SupportTicketAccountLimitFields = (props: Props) => {
  const form = useFormContext<AccountLimitCustomFields>();

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
            errorText={fieldState.error?.message}
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.customerName}
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
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.companyName}
            name="companyName"
            onChange={field.onChange}
            value={field.value}
          />
        )}
        control={form.control}
        name="companyName"
      />
      <SupportTicketProductSelectionFields ticketType="accountLimit" />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            helperText={
              <Link to="https://www.linode.com/pricing/">
                View types of plans
              </Link>
            }
            data-qa-ticket-linode-plan
            errorText={fieldState.error?.message}
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.linodePlan}
            name="linodePlan"
            onChange={field.onChange}
            placeholder="Dedicated 4GB, Shared 8GB, High Memory 24GB, etc."
            value={field.value}
          />
        )}
        control={form.control}
        name="linodePlan"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-use-case
            errorText={fieldState.error?.message}
            expand
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.useCase}
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
            data-qa-ticket-public-info
            errorText={fieldState.error?.message}
            expand
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.publicInfo}
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
