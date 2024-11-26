import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm } from '../types';
import type { AlertServiceType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface CloudPulseResourceSelectProps {
  /**
   * engine option type selected by the user
   */
  engine: null | string;
  /**
   * name used for the component to set in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, string[]>;
  /**
   * region selected by the user
   */
  region: string | undefined;
  /**
   * service type selected by the user
   */
  serviceType: AlertServiceType | null;
}

export const CloudPulseMultiResourceSelect = (
  props: CloudPulseResourceSelectProps
) => {
  const { engine, name, region, serviceType } = { ...props };
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();

  const { data: resources, isError, isLoading } = useResourcesQuery(
    Boolean(region && serviceType),
    serviceType?.toString(),
    {},
    engine !== null ? { engine, region } : { region }
  );

  const getResourcesList = React.useMemo((): Item<string, string>[] => {
    return resources && resources.length > 0
      ? resources.map((resource) => ({
          label: resource.label,
          value: resource.id,
        }))
      : [];
  }, [resources]);

  React.useEffect(() => {
    setValue('resource_ids', []);
  }, [region, serviceType, engine, setValue]);

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Autocomplete
          errorText={
            fieldState.error?.message ??
            (isError ? 'Failed to fetch the resources.' : '')
          }
          onChange={(_, resources: { label: string; value: string }[]) => {
            const resourceIds = resources.map((resource) => resource.value);
            field.onChange(resourceIds);
          }}
          textFieldProps={{
            InputProps: {
              sx: {
                maxHeight: '60px',
                overflow: 'auto',
              },
            },
          }}
          value={
            field.value
              ? getResourcesList.filter((resource) =>
                  field.value.includes(resource.value)
                )
              : []
          }
          autoHighlight
          clearOnBlur
          data-testid="resource-select"
          disabled={!Boolean(region && serviceType)}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          label={serviceType === 'dbaas' ? 'Cluster' : 'Resources'}
          limitTags={2}
          loading={isLoading && Boolean(region && serviceType)}
          multiple
          onBlur={field.onBlur}
          options={getResourcesList}
          placeholder="Select Resources"
        />
      )}
      control={control}
      name={name}
    />
  );
};
