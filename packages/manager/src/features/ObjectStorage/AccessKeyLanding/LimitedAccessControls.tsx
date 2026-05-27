import { FormControlLabel, Toggle, TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { BucketPermissionsTable } from './BucketPermissionsTable';

import type { MODE } from './types';
import type { ObjectStorageKeyBucketAccess } from '@linode/api-v4/lib/object-storage/types';

type LabelWithTooltipProps = {
  labelText: string;
  tooltipText: string;
};

const LabelWithTooltip = ({
  labelText,
  tooltipText,
}: LabelWithTooltipProps) => (
  <React.Fragment>
    <Typography component="span">{labelText}</Typography>
    {tooltipText && <TooltipIcon status="info" text={tooltipText} />}
  </React.Fragment>
);

interface Props {
  bucket_access: null | ObjectStorageKeyBucketAccess[];
  checked: boolean;
  handleToggle: () => void;
  mode: MODE;
  selectedRegions?: string[];
  updateScopes: (newScopes: ObjectStorageKeyBucketAccess[]) => void;
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
        label={
          <LabelWithTooltip
            labelText="Limited Access"
            tooltipText="A Limited Access key has no permissions and you can manually set them. If you don't turn on Limited Access, the key is granted full permission in all regions."
          />
        }
        sx={(theme) => ({
          marginBottom: theme.spacing(0.5),
          marginTop: theme.spacing(0.5),
        })}
      />
      <Typography>
        Limited access keys can list all buckets, regardless of access. They can
        also create new buckets, but will not have access to the buckets they
        create.
      </Typography>
      <BucketPermissionsTable checked={checked} {...rest} />
    </>
  );
});
