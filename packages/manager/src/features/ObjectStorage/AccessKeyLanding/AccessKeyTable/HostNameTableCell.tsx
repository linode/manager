import { StyledLinkButton } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { pluralize } from 'src/utilities/pluralize';
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
  const formatEndpoint = (region: ObjectStorageKeyRegions) => {
    const label = regionsLookup[region.id]?.label;
    const endpointType = region.endpoint_type
      ? ` (${region.endpoint_type})`
      : '';
    return `${label}${endpointType}: ${region.s3_endpoint}`;
  };

  const firstRegion = regions[0];
  const formattedFirstEndpoint = formatEndpoint(firstRegion);
  const allEndpoints = regions.map(formatEndpoint).join('\n');
  const showMultipleRegions = regions.length > 1;

  return (
    <TableCell>
      {formattedFirstEndpoint}&nbsp;
      {showMultipleRegions ? (
        <>
          | + {pluralize('region', 'regions', regions.length - 1)} |&nbsp;
          <StyledLinkButton
            onClick={() => {
              setHostNames(regions);
              setShowHostNamesDrawers(true);
            }}
          >
            Show All
          </StyledLinkButton>
          <StyledCopyIcon text={allEndpoints} />
        </>
      ) : (
        <StyledCopyIcon text={firstRegion.s3_endpoint} />
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
  marginLeft: theme.spacing(0.5),
}));
