import { ScopeObject } from '@linode/api-v4/lib/object-storage/types';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';

import { AccessTable } from './AccessTable';
import { MODE } from './types';

interface Props {
  bucket_access: ScopeObject[] | null;
  checked: boolean;
  handleToggle: () => void;
  mode: MODE;
  updateScopes: (newScopes: ScopeObject[]) => void;
}

export const LimitedAccessControls = React.memo((props: Props) => {
  const { checked, handleToggle, ...rest } = props;

  return (
    <>
      <FormControlLabel
        control={
          <Toggle
            checked={checked}
            data-testid="limited-permissions-toggle"
            disabled={props.mode !== 'creating'}
            onChange={handleToggle}
          />
        }
        label={'Limited Access'}
      />
      <Typography>
        Limited access keys can list all buckets, regardless of access. They can
        also create new buckets, but will not have access to the buckets they
        create.
      </Typography>
      <AccessTable checked={checked} {...rest} />
    </>
  );
});
