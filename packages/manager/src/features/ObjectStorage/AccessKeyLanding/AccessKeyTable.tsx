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
import Typography from 'src/components/core/Typography';
import { PaginationProps } from 'src/components/Pagey';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import AccessKeyMenu from './AccessKeyMenu';

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
      width: '40%'
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
  openRevokeDialog: (objectStorageKey: Linode.ObjectStorageKey) => void;
  openDrawerForEditing: (objectStorageKey: Linode.ObjectStorageKey) => void;
}

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  PaginationProps<Linode.ObjectStorageKey>;

export const AccessKeyTable: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    data,
    loading,
    error,
    isRestrictedUser,
    openRevokeDialog,
    openDrawerForEditing
  } = props;

  const renderContent = () => {
    if (isRestrictedUser) {
      return <TableRowEmptyState colSpan={6} />;
    }

    if (loading) {
      return <TableRowLoading colSpan={6} />;
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
      <TableRowEmptyState colSpan={6} />
    );
  };

  const renderRows = (objectStorageKeys: Linode.ObjectStorageKey[]) => {
    return objectStorageKeys.map((eachKey: Linode.ObjectStorageKey) => (
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
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <React.Fragment>
      <Paper className={classes.paper}>
        <Table aria-label="List of Object Storage Access Keys">
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
      </Paper>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<
  CombinedProps,
  Props & PaginationProps<Linode.ObjectStorageKey>
>(styled);

export default enhanced(AccessKeyTable);
