import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { compose } from 'recompose';
import CopyTooltip from 'src/components/CopyTooltip';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { PaginationProps } from 'src/components/Pagey';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import AccessKeyMenu from './AccessKeyMenu';
import AccessKeyMenu_CMR from './AccessKeyMenu_CMR';
import useFlags from 'src/hooks/useFlags';

type ClassNames = 'root' | 'headline' | 'paper' | 'labelCell' | 'copyIcon';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    headline: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    paper: {
      marginBottom: theme.spacing(2)
    },
    labelCell: {
      width: '48%'
    },
    copyIcon: {
      '& svg': {
        top: 1,
        width: 12,
        height: 12
      },
      marginLeft: theme.spacing(1)
    }
  });

interface Props {
  isRestrictedUser: boolean;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
  openDrawerForEditing: (objectStorageKey: ObjectStorageKey) => void;
}

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  PaginationProps<ObjectStorageKey>;

export const AccessKeyTable: React.FC<CombinedProps> = props => {
  const {
    classes,
    data,
    loading,
    error,
    isRestrictedUser,
    openRevokeDialog,
    openDrawerForEditing
  } = props;

  const flags = useFlags();

  const renderContent = () => {
    if (isRestrictedUser) {
      return <TableRowEmptyState colSpan={12} />;
    }

    if (loading) {
      return <TableRowLoading colSpan={3} firstColWidth={50} oneLine />;
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
    return objectStorageKeys.map((eachKey: ObjectStorageKey) =>
      flags.cmr ? (
        <TableRow_CMR key={eachKey.id} data-qa-table-row={eachKey.label}>
          <TableCell_CMR>
            <Typography variant="body2" component="h3" data-qa-key-label>
              {eachKey.label}
            </Typography>
          </TableCell_CMR>
          <TableCell_CMR>
            <Typography variant="body1" data-qa-key-created>
              {eachKey.access_key}
              <CopyTooltip
                text={eachKey.access_key}
                className={classes.copyIcon}
              />
            </Typography>
          </TableCell_CMR>
          <TableCell_CMR>
            <AccessKeyMenu_CMR
              objectStorageKey={eachKey}
              openRevokeDialog={openRevokeDialog}
              openDrawerForEditing={openDrawerForEditing}
              label={eachKey.label}
            />
          </TableCell_CMR>
        </TableRow_CMR>
      ) : (
        <TableRow key={eachKey.id} data-qa-table-row={eachKey.label}>
          <TableCell parentColumn="Label">
            <Typography variant="h3" data-qa-key-label>
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
              openDrawerForEditing={openDrawerForEditing}
              label={eachKey.label}
            />
          </TableCell>
        </TableRow>
      )
    );
  };

  return (
    <React.Fragment>
      <Paper className={classes.paper}>
        {flags.cmr ? (
          <Table_CMR
            aria-label="List of Object Storage Access Keys"
            rowCount={data && data.length}
            colCount={2}
          >
            <TableHead>
              <TableRow_CMR data-qa-table-head>
                <TableCell_CMR
                  className={classes.labelCell}
                  data-qa-header-label
                >
                  Label
                </TableCell_CMR>
                <TableCell_CMR className={classes.labelCell} data-qa-header-key>
                  Access Key
                </TableCell_CMR>
                {/* empty cell for kebab menu */}
                <TableCell_CMR />
              </TableRow_CMR>
            </TableHead>
            <TableBody>{renderContent()}</TableBody>
          </Table_CMR>
        ) : (
          <Table
            aria-label="List of Object Storage Access Keys"
            rowCount={data && data.length}
            colCount={2}
          >
            <TableHead>
              <TableRow data-qa-table-head role="rowgroup">
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
        )}
      </Paper>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<
  CombinedProps,
  Props & PaginationProps<ObjectStorageKey>
>(styled);

export default enhanced(AccessKeyTable);
