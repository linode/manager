import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Typography } from 'src/components/Typography';
import { AccessTable } from './AccessTable';
import { Scope } from '@linode/api-v4/lib/object-storage/types';
import { MODE } from './types';
import { Toggle } from 'src/components/Toggle';

interface Props {
  mode: MODE;
  checked: boolean;
  bucket_access: Scope[] | null;
  updateScopes: (newScopes: Scope[]) => void;
  handleToggle: () => void;
}

export const LimitedAccessControls = React.memo((props: Props) => {
  const { checked, handleToggle, ...rest } = props;

  return (
    <>
      <FormControlLabel
        control={
          <Toggle
            onChange={handleToggle}
            checked={checked}
            data-testid="limited-permissions-toggle"
            disabled={props.mode !== 'creating'}
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
