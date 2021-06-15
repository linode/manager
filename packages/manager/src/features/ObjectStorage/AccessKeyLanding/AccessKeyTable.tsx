import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { PaginationProps } from 'src/components/Pagey';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import AccessKeyMenu from './AccessKeyMenu';
import { OpenAccessDrawer } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  labelCell: {
    width: '35%',
  },
  copyIcon: {
    marginLeft: theme.spacing(),
    '& svg': {
      top: 1,
      width: 12,
      height: 12,
    },
  },
}));

interface Props {
  isRestrictedUser: boolean;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
  openDrawer: OpenAccessDrawer;
}

export type CombinedProps = Props & PaginationProps<ObjectStorageKey>;

export const AccessKeyTable: React.FC<CombinedProps> = (props) => {
  const {
    data,
    loading,
    error,
    isRestrictedUser,
    openRevokeDialog,
    openDrawer,
  } = props;

  const classes = useStyles();

  const renderContent = () => {
    if (isRestrictedUser) {
      return <TableRowEmptyState colSpan={12} />;
    }

    if (loading) {
      return <TableRowLoading colSpan={3} widths={[50]} oneLine />;
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
      <TableRowEmptyState colSpan={12} />
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
            <CopyTooltip
              text={eachKey.access_key}
              className={classes.copyIcon}
            />
          </Typography>
        </TableCell>
        <TableCell>
          <AccessKeyMenu
            objectStorageKey={eachKey}
            openRevokeDialog={openRevokeDialog}
            openDrawer={openDrawer}
            label={eachKey.label}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Table
      aria-label="List of Object Storage Access Keys"
      rowCount={data && data.length}
      colCount={2}
    >
      <TableHead>
        <TableRow data-qa-table-head>
          <TableCell className={classes.labelCell} data-qa-header-label>
            Label
          </TableCell>
          <TableCell className={classes.labelCell} data-qa-header-key>
            Access Key
          </TableCell>
          {/* empty cell for kebab menu */}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>{renderContent()}</TableBody>
    </Table>
  );
};

export default AccessKeyTable;
