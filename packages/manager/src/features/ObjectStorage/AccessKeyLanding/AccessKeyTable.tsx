import * as React from 'react';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import Typography from 'src/components/core/Typography';
import { AccessKeyMenu } from './AccessKeyMenu';
import { APIError } from '@linode/api-v4/lib/types';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { OpenAccessDrawer } from './types';
import { styled } from '@mui/material/styles';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

export interface AccessKeyTableProps {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | undefined | null;
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
      <TableRow key={eachKey.id} data-qa-table-row={eachKey.label}>
        <TableCell parentColumn="Label">
          <Typography variant="body1" component="h3" data-qa-key-label>
            {eachKey.label}
          </Typography>
        </TableCell>
        <TableCell parentColumn="Access Key">
          <Typography variant="body1" data-qa-key-created>
            {eachKey.access_key}
            <StyledCopyIcon text={eachKey.access_key} />
          </Typography>
        </TableCell>
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
          {/* empty cell for kebab menu */}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>{renderContent()}</TableBody>
    </Table>
  );
};

const StyledCopyIcon = styled(CopyTooltip)(({ theme }) => ({
  marginLeft: theme.spacing(),
  '& svg': {
    top: 1,
    width: 12,
    height: 12,
  },
}));

const StyledLabelCell = styled(TableCell)(() => ({
  width: '35%',
}));
