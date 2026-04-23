import { LinkButton } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';

import { useAccessKeyDrawers } from '../hooks/useAccessKeyDrawers';

import type { ObjectStorageKey, ObjectStorageKeyRegions } from '@linode/api-v4';

interface Props {
  storageKeyData: ObjectStorageKey;
}

export const HostNameTableCell = (props: Props) => {
  const { storageKeyData } = props;
  const { openDrawer } = useAccessKeyDrawers();

  const { availableStorageRegions, regionsByIdMap } = useObjectStorageRegions();

  const { regions } = storageKeyData;

  if (
    !regionsByIdMap ||
    !availableStorageRegions ||
    !regions ||
    regions.length === 0
  ) {
    return <TableCell>None</TableCell>;
  }
  const formatEndpoint = (region: ObjectStorageKeyRegions) => {
    const label = regionsByIdMap[region.id]?.label;
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
          <LinkButton
            onClick={() =>
              openDrawer('access-key-hostnames', storageKeyData.id)
            }
          >
            Show All
          </LinkButton>
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
