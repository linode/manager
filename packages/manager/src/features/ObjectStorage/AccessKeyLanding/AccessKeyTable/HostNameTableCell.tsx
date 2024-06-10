import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';
import { styled } from '@mui/material/styles';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getRegionsByRegionId } from 'src/utilities/regions';

type Props = {
  setHostNames: (hostNames: RegionS3EndpointAndID[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
  storageKeyData: ObjectStorageKey;
};

export const HostNameTableCell = ({
  setHostNames,
  setShowHostNamesDrawers,
  storageKeyData,
}: Props) => {
  const { data: regionsData } = useRegionsQuery();

  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const { regions } = storageKeyData;

  if (!regionsLookup || !regionsData || !regions || regions.length === 0) {
    return <TableCell>None</TableCell>;
  }

  return (
    <TableCell>
      {`${regionsLookup[storageKeyData.regions[0].id].label}: ${
        storageKeyData?.regions[0]?.s3_endpoint
      } `}
      {storageKeyData?.regions?.length === 1 && (
        <StyledCopyIcon text={storageKeyData.regions[0].s3_endpoint} />
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
