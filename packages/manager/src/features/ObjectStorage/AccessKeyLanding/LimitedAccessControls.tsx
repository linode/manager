import { FormControlLabel, Toggle, TooltipIcon, Typography } from '@linode/ui';
import * as React from 'react';

import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

import { AccessTable } from './AccessTable';
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
    {tooltipText && <TooltipIcon status="help" text={tooltipText} />}
  </React.Fragment>
);

interface Props {
  bucket_access: ObjectStorageKeyBucketAccess[] | null;
  checked: boolean;
  handleToggle: () => void;
  mode: MODE;
  selectedRegions?: string[];
  updateScopes: (newScopes: ObjectStorageKeyBucketAccess[]) => void;
}

export const LimitedAccessControls = React.memo((props: Props) => {
  const { checked, handleToggle, ...rest } = props;

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

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
          isObjMultiClusterEnabled ? (
            <LabelWithTooltip
              labelText="Limited Access"
              tooltipText="A Limited Access key has no permissions and you can manually set them. If you don't turn on Limited Access, the key is granted full permission in all regions."
            />
          ) : (
            'Limited Access'
          )
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
      {isObjMultiClusterEnabled ? (
        <BucketPermissionsTable checked={checked} {...rest} />
      ) : (
        <AccessTable checked={checked} {...rest} />
      )}
    </>
  );
});
