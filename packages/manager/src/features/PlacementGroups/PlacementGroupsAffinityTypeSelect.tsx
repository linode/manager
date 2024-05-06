import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Link } from 'src/components/Link';
import { ListItem } from 'src/components/ListItem';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';

import { PLACEMENT_GROUPS_DOCS_LINK } from './constants';
import { affinityTypeOptions } from './utils';

import type { FormikHelpers } from 'formik';

interface Props {
  disabledPlacementGroupCreateButton: boolean;
  error: string | undefined;
  setFieldValue: FormikHelpers<any>['setFieldValue'];
}

export const PlacementGroupsAffinityTypeSelect = (props: Props) => {
  const { disabledPlacementGroupCreateButton, error, setFieldValue } = props;
  return (
    <Autocomplete
      defaultValue={affinityTypeOptions.find(
        (option) => option.value === 'anti_affinity:local'
      )}
      onChange={(_, value) => {
        setFieldValue('affinity_type', value?.value ?? '');
      }}
      renderOption={(props, option) => {
        const isDisabledMenuItem = option.value === 'affinity:local';

        return (
          <Tooltip
            title={
              isDisabledMenuItem ? (
                <Typography>
                  Currently, only Anti-affinity placement groups are supported.{' '}
                  <Link to={PLACEMENT_GROUPS_DOCS_LINK}>Learn more</Link>.
                </Typography>
              ) : (
                ''
              )
            }
            data-qa-tooltip={isDisabledMenuItem ? 'antiAffinityHelperText' : ''}
            disableFocusListener={!isDisabledMenuItem}
            disableHoverListener={!isDisabledMenuItem}
            disableTouchListener={!isDisabledMenuItem}
            enterDelay={200}
            enterNextDelay={200}
            enterTouchDelay={200}
            key={option.value}
          >
            <ListItem
              {...props}
              className={
                isDisabledMenuItem
                  ? `${props.className} Mui-disabled`
                  : props.className
              }
              onClick={(e) =>
                isDisabledMenuItem
                  ? e.preventDefault()
                  : props.onClick
                  ? props.onClick(e)
                  : null
              }
              component="li"
            >
              {option.label}
            </ListItem>
          </Tooltip>
        );
      }}
      textFieldProps={{
        tooltipText: (
          <Typography>
            Linodes in a placement group that use Affinity are physically closer
            together, possibly on the same hardware. This can help with
            performance. Linodes in a placement group that use Anti-affinity are
            in separate fault domains, but still in the same data center. Use
            this to support a high-availability model.
          </Typography>
        ),
      }}
      disableClearable={true}
      disabled={disabledPlacementGroupCreateButton}
      errorText={error}
      label="Affinity Type"
      options={affinityTypeOptions}
      placeholder="Select an Affinity Type"
    />
  );
};
