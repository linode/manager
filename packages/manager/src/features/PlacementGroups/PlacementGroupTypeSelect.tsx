import { Autocomplete, ListItem, Tooltip, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import { PLACEMENT_GROUPS_DOCS_LINK } from './constants';
import { placementGroupTypeOptions } from './utils';

import type { FormikHelpers } from 'formik';

interface Props {
  disabledPlacementGroupCreateButton: boolean;
  error: string | undefined;
  setFieldValue: FormikHelpers<any>['setFieldValue'];
}

export const PlacementGroupTypeSelect = (props: Props) => {
  const { disabledPlacementGroupCreateButton, error, setFieldValue } = props;
  return (
    <Autocomplete
      defaultValue={placementGroupTypeOptions.find(
        (option) => option.value === 'anti_affinity:local'
      )}
      disableClearable={true}
      disabled={disabledPlacementGroupCreateButton}
      errorText={error}
      label="Placement Group Type"
      onChange={(_, value) => {
        setFieldValue('placement_group_type', value?.value ?? '');
      }}
      options={placementGroupTypeOptions}
      placeholder="Select an Placement Group Type"
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        const isDisabledMenuItem = option.value === 'affinity:local';

        return (
          <Tooltip
            data-qa-tooltip={isDisabledMenuItem ? 'antiAffinityHelperText' : ''}
            disableFocusListener={!isDisabledMenuItem}
            disableHoverListener={!isDisabledMenuItem}
            disableTouchListener={!isDisabledMenuItem}
            enterDelay={200}
            enterNextDelay={200}
            enterTouchDelay={200}
            key={key}
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
          >
            <ListItem
              {...rest}
              className={
                isDisabledMenuItem
                  ? `${props.className} Mui-disabled`
                  : props.className
              }
              component="li"
              onClick={(e) =>
                isDisabledMenuItem
                  ? e.preventDefault()
                  : props.onClick
                    ? props.onClick(e)
                    : null
              }
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
    />
  );
};
