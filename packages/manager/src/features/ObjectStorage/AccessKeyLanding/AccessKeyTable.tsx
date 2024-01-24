import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { getRegionsByRegionId } from 'src/utilities/regions';

import { AccessKeyMenu } from './AccessKeyMenu';
import { HostNamesDrawer } from './HostNamesDrawer';
import { OpenAccessDrawer } from './types';

export interface AccessKeyTableProps {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | null | undefined;
  isLoading: boolean;
  isRestrictedUser: boolean;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
}

export const AccessKeyTable = (props: AccessKeyTableProps) => {
  const {
    data,
    error,
    isLoading,
    isRestrictedUser,
    openDrawer,
    openRevokeDialog,
  } = props;

  const [showHostNamesDrawer, setShowHostNamesDrawers] = useState<boolean>(
    false
  );
  const [hostNames, setHostNames] = useState<RegionS3EndpointAndID[]>([]);

  const flags = useFlags();
  const { account } = useAccountManagement();
  const { data: regionsData } = useRegionsQuery();

  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const isObjMultiClusterEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const renderContent = () => {
    if (isRestrictedUser) {
      return <TableRowEmpty colSpan={12} />;
    }

    if (isLoading) {
      return <TableRowLoading columns={3} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={6}
          message="We were unable to load your Access Keys."
        />
      );
    }

    return data && data.length > 0 ? (
      renderRows(data)
    ) : (
      <TableRowEmpty colSpan={12} />
    );
  };

  const renderRows = (objectStorageKeys: ObjectStorageKey[]) => {
    return objectStorageKeys.map((eachKey: ObjectStorageKey) => (
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
          <AccessKeyMenu
            label={eachKey.label}
            objectStorageKey={eachKey}
            openDrawer={openDrawer}
            openRevokeDialog={openRevokeDialog}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Table
        aria-label="List of Object Storage Access Keys"
        colCount={2}
        data-testid="data-qa-access-key-table"
        rowCount={data?.length}
      >
        <TableHead>
          <TableRow data-qa-table-head>
            <StyledLabelCell data-qa-header-label>Label</StyledLabelCell>
            <StyledLabelCell data-qa-header-key>Access Key</StyledLabelCell>
            {isObjMultiClusterEnabled && (
              <StyledLabelCell data-qa-header-key>
                Regions/S3 Hostnames
              </StyledLabelCell>
            )}
            {/* empty cell for kebab menu */}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderContent()}</TableBody>
      </Table>
      {isObjMultiClusterEnabled && (
        <HostNamesDrawer
          onClose={() => setShowHostNamesDrawers(false)}
          open={showHostNamesDrawer}
          regions={hostNames}
        />
      )}
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

const StyledLabelCell = styled(TableCell)(() => ({
  width: '35%',
}));
