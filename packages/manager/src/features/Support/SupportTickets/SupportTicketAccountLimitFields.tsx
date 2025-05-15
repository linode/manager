import { useAccount } from '@linode/queries';
import { TextField } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
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

    companyName: account?.company ?? '',
    numberOfEntities: '',

    linodePlan:
      linodeType?.label ??
      kubeTypes.map((type) => type.formattedLabel).join(', ') ??
      '',
    useCase: '',

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
        control={control}
        name="customerName"
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
      />
      <Controller
        control={control}
        name="companyName"
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
      />
      <SupportTicketProductSelectionFields ticketType="accountLimit" />
      {shouldShowLinodePlanField && (
        <Controller
          control={control}
          name="linodePlan"
          render={({ field, fieldState }) => (
            <TextField
              data-qa-ticket-linode-plan
              errorText={fieldState.error?.message}
              helperText={
                <Link to="https://www.linode.com/pricing/">
                  View types of plans
                </Link>
              }
              label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.linodePlan}
              name="linodePlan"
              onChange={field.onChange}
              placeholder="Dedicated 4GB, Shared 8GB, High Memory 24GB, etc."
              value={field.value}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name="useCase"
        render={({ field, fieldState }) => (
          <TextField
            data-qa-ticket-use-case
            errorText={fieldState.error?.message}
            expand
            label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.useCase.replace(
              'entities',
              getEntityNameFromEntityType(entityType, true)
            )}
            multiline
            name="useCase"
            onChange={field.onChange}
            required
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="publicInfo"
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
      />
    </>
  );
};
