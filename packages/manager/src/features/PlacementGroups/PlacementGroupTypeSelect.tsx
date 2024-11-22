import { Autocomplete, ListItem, Tooltip } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

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
      onChange={(_, value) => {
        setFieldValue('placement_group_type', value?.value ?? '');
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
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
            key={key}
          >
            <ListItem
              {...rest}
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
      label="Placement Group Type"
      options={placementGroupTypeOptions}
      placeholder="Select an Placement Group Type"
    />
  );
};
