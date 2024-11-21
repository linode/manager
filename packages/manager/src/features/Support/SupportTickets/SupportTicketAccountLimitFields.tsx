import { TextField } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { useAccount } from 'src/queries/account/account';
import { useSpecificTypes, useTypeQuery } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import { ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP } from './constants';
import { SupportTicketProductSelectionFields } from './SupportTicketProductSelectionFields';
import { getEntityNameFromEntityType } from './ticketUtils';

import type { CustomFields } from './constants';
import type {
  FormPayloadValues,
  SupportTicketFormFields,
} from './SupportTicketDialog';

export interface AccountLimitCustomFields extends CustomFields {
  linodePlan: string;
  numberOfEntities: string;
}

interface Props {
  prefilledFormPayloadValues?: FormPayloadValues;
}

export const SupportTicketAccountLimitFields = ({
  prefilledFormPayloadValues,
}: Props) => {
  const { control, formState, reset, watch } = useFormContext<
    AccountLimitCustomFields & SupportTicketFormFields
  >();
  const { entityType } = watch();

  const prefilledLinodeType =
    prefilledFormPayloadValues && 'type' in prefilledFormPayloadValues
      ? prefilledFormPayloadValues.type
      : '';
  const prefilledKubeTypes =
    prefilledFormPayloadValues && 'node_pools' in prefilledFormPayloadValues
      ? prefilledFormPayloadValues.node_pools?.map((pool) => pool.type)
      : [];

  const { data: account } = useAccount();
  const { data: linodeType } = useTypeQuery(
    prefilledLinodeType ?? '',
    Boolean(prefilledLinodeType)
  );
  const kubeTypesQuery = useSpecificTypes(
    prefilledKubeTypes ?? [],
    Boolean(prefilledKubeTypes)
  );
  const kubeTypes = extendTypesQueryResult(kubeTypesQuery);

  // Must be in the same order as the fields are displayed in the form.
  const defaultValues = {
    ...formState.defaultValues,
    customerName: `${account?.first_name ?? ''} ${account?.last_name ?? ''}`,
    // eslint-disable-next-line perfectionist/sort-objects
    companyName: account?.company ?? '',
    numberOfEntities: '',
    // eslint-disable-next-line perfectionist/sort-objects
    linodePlan:
      linodeType?.label ??
      kubeTypes.map((type) => type.formattedLabel).join(', ') ??
      '',
    useCase: '',
    // eslint-disable-next-line perfectionist/sort-objects
    publicInfo: '',
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
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.useCase.replace(
              'entities',
              getEntityNameFromEntityType(entityType, true)
            )}
            data-qa-ticket-use-case
            errorText={fieldState.error?.message}
            expand
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
