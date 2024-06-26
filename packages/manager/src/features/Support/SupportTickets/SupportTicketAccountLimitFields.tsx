import * as React from 'react';

import { TextField } from 'src/components/TextField';
import {
  ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP,
  CustomFields,
} from './constants';
import { Controller, useFormContext } from 'react-hook-form';
import { useAccount } from 'src/queries/account/account';
import { EntityType } from './SupportTicketDialog';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';

export interface AccountLimitCustomFields extends CustomFields {
  numberOfEntities: string;
  linodePlan: string;
}

interface Props {
  entityType: EntityType;
}

export const SupportTicketAccountLimitFields = (props: Props) => {
  const form = useFormContext<AccountLimitCustomFields>();

  const { data: account } = useAccount();
  return (
    <>
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-customer-name
            defaultValue={`${account?.first_name} ${account?.last_name}`}
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
            data-qa-ticket-linode-plan
            errorText={fieldState.error?.message}
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.linodePlan}
            name="linodePlan"
            placeholder="Dedicated 4GB, Shared 8GB, High Memory 24GB, etc."
            onChange={field.onChange}
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
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.useCase}
            name="useCase"
            onChange={field.onChange}
            value={field.value}
            required
            multiline
            expand
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
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.publicInfo}
            name="publicInfo"
            onChange={field.onChange}
            value={field.value}
            required
            multiline
            expand
          />
        )}
        control={form.control}
        name="publicInfo"
      />
    </>
  );
};
