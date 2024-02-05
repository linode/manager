import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';

import { styled } from '@mui/material/styles';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';

import { TableCell } from 'src/components/TableCell';

import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { getRegionsByRegionId } from 'src/utilities/regions';

import { AccessKeyActionMenu } from './AccessKeyActionMenu';
import { OpenAccessDrawer } from '../types';

type Props = {
  objectStorageKeys: ObjectStorageKey[];
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
  setHostNames: (hostNames: RegionS3EndpointAndID[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
};

export const AccessKeyTableRows = ({
  objectStorageKeys,
  openDrawer,
  openRevokeDialog,
  setHostNames,
  setShowHostNamesDrawers,
}: Props) => {
  const { account } = useAccountManagement();
  const { data: regionsData } = useRegionsQuery();
  const flags = useFlags();

  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const isObjMultiClusterEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <>
      {objectStorageKeys.map((eachKey: ObjectStorageKey) => (
        <TableRow data-qa-table-row={eachKey.label} key={eachKey.id}>
          <TableCell parentColumn="Label">
            <Typography component="h3" data-qa-key-label variant="body1">
              {eachKey.label}
            </Typography>
          </TableCell>
          <TableCell parentColumn="Access Key">
            <Typography data-qa-key-created variant="body1">
              {eachKey.access_key}
              <StyledCopyIcon text={eachKey.access_key} />
            </Typography>
          </TableCell>
          {isObjMultiClusterEnabled && regionsLookup && (
            <TableCell>
              {`${regionsLookup[eachKey?.regions[0]?.id].label}: ${
                eachKey?.regions[0]?.s3_endpoint
              } `}
              {eachKey?.regions?.length === 1 && (
                <StyledCopyIcon text={eachKey?.regions[0]?.s3_endpoint} />
              )}
              {eachKey.regions.length > 1 && (
                <StyledLinkButton
                  onClick={() => {
                    setHostNames(eachKey.regions);
                    setShowHostNamesDrawers(true);
                  }}
                  type="button"
                >
                  and {eachKey.regions.length - 1} more...
                </StyledLinkButton>
              )}
            </TableCell>
          )}
          <TableCell>
            <AccessKeyActionMenu
              label={eachKey.label}
              objectStorageKey={eachKey}
              openDrawer={openDrawer}
              openRevokeDialog={openRevokeDialog}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const StyledCopyIcon = styled(CopyTooltip)(({ theme }) => ({
  '& svg': {
    height: 12,
    top: 1,
    width: 12,
  },
  marginLeft: theme.spacing(),
}));
