import * as React from 'react';

import { TextField } from 'src/components/TextField';
import {
  ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP,
  CustomFields,
} from './constants';
import { Controller, useFormContext } from 'react-hook-form';
import { useAccount } from 'src/queries/account/account';

export interface AccountLimitFields extends CustomFields {
  numberOfLinodes: string;
  linodePlan: string;
}

export const SupportTicketAccountLimitFields = () => {
  const form = useFormContext<AccountLimitFields>();

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
            required
            value={field.value}
          />
        )}
        control={form.control}
        name="companyName"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-number-of-linodes
            errorText={fieldState.error?.message}
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.numberOfLinodes}
            name="numberOfLinodes"
            onChange={field.onChange}
            value={field.value}
          />
        )}
        control={form.control}
        name="numberOfLinodes"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-linode-plan
            errorText={fieldState.error?.message}
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.linodePlan}
            name="linodePlan"
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
          />
        )}
        control={form.control}
        name="publicInfo"
      />
    </>
  );
};
