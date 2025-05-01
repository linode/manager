import { Autocomplete } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm } from '../types';
import type { AlertServiceType } from '@linode/api-v4';

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

  const {
    data: resources,
    isError,
    isLoading,
  } = useResourcesQuery(
    Boolean(region && serviceType),
    serviceType?.toString(),
    {},
    serviceType === 'dbaas' ? { engine, region } : { region }
  );

  const getResourcesList = React.useMemo((): Item<string, string>[] => {
    return resources && resources.length > 0
      ? resources.map((resource) => ({
          label: resource.label,
          value: resource.id.toString(),
        }))
      : [];
  }, [resources]);

  /* useEffect is used here to reset the value of entity_ids back to [] when the region, engine, serviceType props are changed ,
      as the options to the Autocomplete component are dependent on those props , the values of the Autocomplete won't match with the given options that are passed
      and this may raise a warning or error with the isOptionEqualToValue prop in the Autocomplete.
  */
  React.useEffect(() => {
    setValue(name, []);
  }, [region, serviceType, engine, setValue, name]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          autoHighlight
          clearOnBlur
          data-testid="resource-select"
          disabled={!(region && serviceType)}
          errorText={
            fieldState.error?.message ??
            (isError ? 'Failed to fetch the resources.' : '')
          }
          isOptionEqualToValue={(option, value) => option.value === value.value}
          label={serviceType === 'dbaas' ? 'Clusters' : 'Resources'}
          limitTags={2}
          loading={isLoading && Boolean(region && serviceType)}
          multiple
          onBlur={field.onBlur}
          onChange={(_, resources: { label: string; value: string }[]) => {
            const resourceIds = resources.map((resource) => resource.value);
            field.onChange(resourceIds);
          }}
          options={getResourcesList}
          placeholder="Select Resources"
          value={
            field.value
              ? getResourcesList.filter((resource) =>
                  field.value.includes(resource.value)
                )
              : []
          }
        />
      )}
    />
  );
};
