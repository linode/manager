import { Autocomplete, ListItemOption, Typography } from '@linode/ui';
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
      disabledItemsFocusable
      errorText={error}
      getOptionDisabled={(option) => option.value === 'affinity:local'}
      label="Placement Group Type"
      onChange={(_, value) => {
        setFieldValue('placement_group_type', value?.value ?? '');
      }}
      options={placementGroupTypeOptions}
      placeholder="Select an Placement Group Type"
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props;
        const isDisabled = option.value === 'affinity:local';

        const disabledReason = (
          <Typography>
            Currently, only Anti-affinity placement groups are supported.{' '}
            <Link to={PLACEMENT_GROUPS_DOCS_LINK}>Learn more</Link>.
          </Typography>
        );

        return (
          <ListItemOption
            disabledOptions={
              isDisabled ? { reason: disabledReason } : undefined
            }
            item={{ ...option, id: option.value }}
            key={key}
            props={rest}
            selected={selected}
          >
            {option.label}
          </ListItemOption>
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
