import {
  Autocomplete,
  Box,
  Chip,
  CloseIcon,
  Typography,
  useTheme,
} from '@linode/ui';
import * as React from 'react';
import type { FieldPathByValue } from 'react-hook-form';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';

import { getAlertBoxStyles } from '../../../Utils/utils';

import type { Item } from '../../../constants';
import type { CreateAlertDefinitionForm } from '../../types';
import type { MetricDefinition } from '@linode/api-v4';

interface Props {
  /**
   * metric definitions used to build dimension options
   */
  metricDefinitions: MetricDefinition[];
  /**
   * name used for the component to set RHF field
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, string[] | undefined>;
}

const ENTITY_OPTION: Item<string, string> = {
  label: 'Entity',
  value: 'entity_id',
};

const MAX_DIMENSIONS = 5;

export const CloudPulseAlertsGroupBy = ({ metricDefinitions, name }: Props) => {
  const flags = useFlags();
  const theme = useTheme();
  const { control, setValue, getValues } =
    useFormContext<CreateAlertDefinitionForm>();

  const serviceType = useWatch({ control, name: 'serviceType' });
  const isObjectStorage = serviceType === 'objectstorage';
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      // Skip default entity injection on initial render to preserve
      // existing form values in Edit / Clone flows
      isFirstRender.current = false;
      return;
    }

    // Ensure entity_id is always present for non-objectstorage services
    const currentValues = getValues(name) ?? [];
    if (!currentValues.includes(ENTITY_OPTION.value)) {
      setValue(name, [ENTITY_OPTION.value, ...currentValues]);
    }
  }, [getValues, name, serviceType, setValue]);

  const options = React.useMemo<Item<string, string>[]>(() => {
    const map = new Map<string, string>();
    map.set(ENTITY_OPTION.value, ENTITY_OPTION.label);

    // Build unique dimension options from metric definitions
    for (const metricDefinition of metricDefinitions ?? []) {
      for (const dimension of metricDefinition.dimensions ?? []) {
        if (!map.has(dimension.dimension_label)) {
          map.set(dimension.dimension_label, dimension.label);
        }
      }
    }

    return Array.from(map.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  }, [metricDefinitions]);

  const getNextValues = (values: string[]): string[] => {
    let nextValues = values;

    // Prevent removing entity_id for non-objectstorage services
    if (!isObjectStorage && !nextValues.includes(ENTITY_OPTION.value)) {
      nextValues = [ENTITY_OPTION.value, ...nextValues];
    }

    // Enforce max dimension selection limit
    return nextValues.slice(0, MAX_DIMENSIONS);
  };

  if (!flags.aclpAlerting?.enableGroupBy) {
    return null;
  }

  return (
    <Box
      data-testid="group-by-box"
      sx={(theme) => ({
        ...getAlertBoxStyles(theme),
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
      })}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
        <Typography variant="h3">Group By</Typography>
      </Box>
      <Typography variant="body1">
        Group by controls how alerts are grouped and evaluated based on selected
        metric dimensions.
        <br />
        Entity is selected by default, but other dimensions can be selected.
      </Typography>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const values: string[] = Array.isArray(field.value)
            ? field.value
            : [];

          const selectedOptions = values.map(
            (value) =>
              options.find((option) => option.value === value) ?? {
                label: value,
                value,
              }
          );

          const hasReachedMaxDimensions =
            selectedOptions.length >= MAX_DIMENSIONS;

          return (
            <Autocomplete
              disabled={!serviceType}
              errorText={fieldState.error?.message}
              getOptionDisabled={(option) => {
                // Prevent disabling/removing Entity for non-objectstorage services
                if (!isObjectStorage && option.value === ENTITY_OPTION.value) {
                  return true;
                }

                // Disable unselected options once max limit is reached
                if (hasReachedMaxDimensions) {
                  return !values.includes(option.value);
                }

                return false;
              }}
              helperText="You can select up to 5 dimensions."
              label="Dimensions"
              limitTags={2}
              multiple
              noMarginTop
              onBlur={field.onBlur}
              onChange={(_, newValue, reason, details) => {
                // Ignore entity removal for non-objectstorage services
                if (
                  reason === 'removeOption' &&
                  !isObjectStorage &&
                  details?.option.value === ENTITY_OPTION.value
                ) {
                  return;
                }

                const newValues = newValue.map((item) => item.value);
                field.onChange(getNextValues(newValues));
              }}
              options={options}
              placeholder={values.length === 0 ? 'Select dimensions' : ''}
              renderValue={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });

                  // Show delete icon only when chip is removable
                  const shouldShowDeleteIcon =
                    option.value !== ENTITY_OPTION.value || isObjectStorage;

                  return (
                    <Chip
                      {...tagProps}
                      deleteIcon={
                        shouldShowDeleteIcon ? <CloseIcon /> : undefined
                      }
                      key={key}
                      label={option.label}
                      onDelete={
                        shouldShowDeleteIcon ? tagProps.onDelete : undefined
                      }
                      style={{
                        // Highlight fixed Entity chip differently
                        backgroundColor:
                          option.value === ENTITY_OPTION.value &&
                          !shouldShowDeleteIcon
                            ? theme.tokens.alias.Background.Neutralsubtle
                            : undefined,
                      }}
                    />
                  );
                })
              }
              value={selectedOptions}
            />
          );
        }}
      />
    </Box>
  );
};
