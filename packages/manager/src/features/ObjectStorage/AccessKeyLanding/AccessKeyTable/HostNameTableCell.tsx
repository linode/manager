import { StyledLinkButton } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

import type { ObjectStorageKey, ObjectStorageKeyRegions } from '@linode/api-v4';

interface Props {
  setHostNames: (hostNames: ObjectStorageKeyRegions[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
  storageKeyData: ObjectStorageKey;
}

export const HostNameTableCell = (props: Props) => {
  const { setHostNames, setShowHostNamesDrawers, storageKeyData } = props;

  const { data: regionsData } = useRegionsQuery();

  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const { regions } = storageKeyData;

  if (!regionsLookup || !regionsData || !regions || regions.length === 0) {
    return <TableCell>None</TableCell>;
  }
  const label = regionsLookup[storageKeyData.regions[0].id]?.label;
  const s3Endpoint = storageKeyData?.regions[0]?.s3_endpoint;
  const endpointType = storageKeyData?.regions[0]?.endpoint_type;

  return (
    <TableCell>
      {label}
      {endpointType && ` (${endpointType})`}: {s3Endpoint}&nbsp;
      {storageKeyData?.regions?.length === 1 && (
        <StyledCopyIcon text={s3Endpoint} />
      )}
      {storageKeyData.regions.length > 1 && (
        <StyledLinkButton
          onClick={() => {
            setHostNames(storageKeyData.regions);
            setShowHostNamesDrawers(true);
          }}
          type="button"
        >
          and {storageKeyData.regions.length - 1} more...
        </StyledLinkButton>
      )}
    </TableCell>
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
