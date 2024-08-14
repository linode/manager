import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { TextField } from 'src/components/TextField';
import { useAccount } from 'src/queries/account/account';

import { ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP } from './constants';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';

import type { CustomFields } from './constants';
import type { SupportTicketFormFields } from './SupportTicketDialog';

export interface AccountLimitCustomFields extends CustomFields {
  linodePlan: string;
  numberOfEntities: string;
}

export const SupportTicketAccountLimitFields = () => {
  const { control, formState, reset, watch } = useFormContext<
    AccountLimitCustomFields & SupportTicketFormFields
  >();

  const { data: account } = useAccount();

  const { entityType } = watch();

  const defaultValues = {
    companyName: account?.company,
    customerName: `${account?.first_name} ${account?.last_name}`,
    ...formState.defaultValues,
  };

  const shouldShowLinodePlanField =
    entityType === 'linode_id' || entityType === 'lkecluster_id';

  React.useEffect(() => {
    reset(defaultValues);
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
        control={control}
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
        control={control}
        name="companyName"
      />
      <SupportTicketProductSelectionFields ticketType="accountLimit" />
      {shouldShowLinodePlanField && (
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
          control={control}
          name="linodePlan"
        />
      )}
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
        control={control}
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
        control={control}
        name="publicInfo"
      />
    </>
  );
};
