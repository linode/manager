import {
  Database,
  DatabaseConnection,
  DatabaseStatus,
  getDatabaseConnection
} from '@linode/api-v4/lib/databases';
import { APIError } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import Chip from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import InlineTextLoader from 'src/components/InlineTextLoader';
import TagCell from 'src/components/TagCell';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useDatabases from 'src/hooks/useDatabases';
import { useDialog } from 'src/hooks/useDialog';
import useOpenClose from 'src/hooks/useOpenClose';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';

interface DatabaseEntityDetailProps {
  database: Database;
}

const DatabaseEntityDetail: React.FC<DatabaseEntityDetailProps> = props => {
  const { database } = props;

  const { deleteDatabase } = useDatabases();
  const history = useHistory();

  const { dialog, closeDialog, openDialog, submitDialog } = useDialog(
    deleteDatabase
  );

  const connectionDetails = useAPIRequest<DatabaseConnection | null>(
    () => getDatabaseConnection(database.id),
    null
  );

  return (
    <>
      <EntityDetail
        header={
          <Header
            label={database.label}
            status={database.status}
            handleClickDelete={() => openDialog(database.id, database.label)}
          />
        }
        body={
          <Body
            numCPUs={database.vcpus}
            // Memory is returned by the API in MB.
            gbRAM={database.memory / 1024}
            gbStorage={database.disk}
            typeLabel="MySQL" // @todo: How to make this dynamic?
            connectionDetailsLoading={connectionDetails.loading}
            connectionDetailsData={connectionDetails.data}
            connectionDetailsError={connectionDetails.error}
          />
        }
        footer={
          <Footer
            plan=""
            regionDisplay=""
            id={database.id}
            created={database.created}
            tags={database.tags}
            label={database.label}
          />
        }
      />
      <DeletionDialog
        typeToConfirm
        label={dialog.entityLabel ?? ''}
        entity="database"
        error={dialog.error}
        open={dialog.isOpen}
        loading={dialog.isLoading}
        onClose={closeDialog}
        onDelete={() => {
          submitDialog(dialog.entityID).then(() => {
            history.push('/databases');
          });
        }}
      />
    </>
  );
};

export default React.memo(DatabaseEntityDetail);

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  label: string;
  status: string;
  handleClickDelete: () => void;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    width: '100%'
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    width: '100%'
  },
  statusChip: {
    ...theme.applyStatusPillStyles,
    marginLeft: theme.spacing()
  },
  statusReady: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGreen
    }
  },
  statusInitializing: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iOrange
    }
  },
  statusError: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iRed
    }
  },
  statusUnknown: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGrey
    }
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    height: 40
  },
  actionItem: {
    minWidth: 'auto'
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const { label, status, handleClickDelete } = props;

  const classes = useHeaderStyles();

  const statusToClass: Record<DatabaseStatus, string> = {
    initializing: classes.statusInitializing,
    ready: classes.statusReady,
    error: classes.statusError,
    unknown: classes.statusUnknown
  };

  return (
    <>
      <Grid
        container
        className={classes.root}
        alignItems="center"
        justify="space-between"
      >
        <Grid item className="px0">
          <Breadcrumb
            firstAndLastOnly
            labelTitle={label}
            pathname={location.pathname}
            data-qa-title
          />
        </Grid>
        <Grid item className="px0">
          <DocumentationButton href="https://www.linode.com/" />
        </Grid>
      </Grid>
      <EntityHeader
        parentLink="/databases"
        parentText="Databases"
        title={label}
        bodyClassName={classes.body}
        body={
          <Grid
            container
            className="m0"
            alignItems="center"
            justify="space-between"
          >
            <Grid item className="py0">
              <Chip
                className={classnames({
                  [classes.statusChip]: true,
                  [statusToClass[status]]: true,
                  statusOtherDetail: ['initializing'].includes(status)
                })}
                label={status.toUpperCase()}
                component="span"
              />
            </Grid>
            <Grid item className={`${classes.actionItemsOuter} py0`}>
              {/* @todo: Make the "Resize" button functional. */}
              <Button buttonType="secondary" className={classes.actionItem}>
                Resize
              </Button>
              <Button
                buttonType="secondary"
                className={classes.actionItem}
                onClick={handleClickDelete}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        }
      />
    </>
  );
};

// =============================================================================
// Body
// =============================================================================
export interface BodyProps {
  numCPUs: number;
  gbRAM: number;
  gbStorage: number;
  typeLabel: string;
  connectionDetailsData: DatabaseConnection | null;
  connectionDetailsLoading: boolean;
  connectionDetailsError?: APIError[];
}

const useBodyStyles = makeStyles((theme: Theme) => ({
  body: {
    padding: theme.spacing(2)
  },
  columnLabel: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold
  },
  summaryContainer: {
    flexBasis: '28%'
  },
  summaryContent: {
    '& > div': {
      flexBasis: '50%',
      [theme.breakpoints.down(720)]: {
        flexBasis: '100%'
      }
    },
    '& p': {
      color: theme.cmrTextColors.tableStatic
    }
  },
  ipContainer: {
    paddingLeft: '40px !important'
  },
  ipList: {
    marginTop: 4,
    color: theme.cmrTextColors.tableStatic,
    '& li': {
      padding: 0,
      fontSize: '0.875rem',
      lineHeight: 1.43
    }
  },
  accessTableContainer: {
    flexBasis: '72%',
    flexWrap: 'nowrap'
  },
  accessTableContent: {
    '&.MuiGrid-item': {
      padding: 0,
      paddingLeft: theme.spacing()
    }
  },
  accessTable: {
    tableLayout: 'fixed',
    '& tr': {
      height: 34
    },
    '& th': {
      backgroundColor: theme.cmrBGColors.bgAccessHeader,
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`,
      color: theme.cmrTextColors.textAccessTable,
      fontSize: '0.875rem',
      fontWeight: 'bold',
      lineHeight: 1,
      padding: theme.spacing(),
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: 140
    },
    '& td': {
      backgroundColor: theme.cmrBGColors.bgAccessRow,
      border: 'none',
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`,
      lineHeight: 1,
      fontSize: '0.875rem',
      overflowX: 'auto',
      padding: theme.spacing(),
      whiteSpace: 'nowrap'
    }
  },
  code: {
    color: theme.cmrTextColors.textAccessCode,
    fontFamily: '"SourceCodePro", monospace, sans-serif'
  }
}));

const Body: React.FC<BodyProps> = props => {
  const {
    numCPUs,
    gbRAM,
    gbStorage,
    typeLabel,
    connectionDetailsData,
    connectionDetailsLoading,
    connectionDetailsError
  } = props;

  const classes = useBodyStyles();

  return (
    <Grid
      container
      item
      className={classes.body}
      direction="row"
      justify="space-between"
    >
      <Grid
        container
        item
        className={classes.summaryContainer}
        direction="column"
      >
        <Grid item className={classes.columnLabel}>
          Summary
        </Grid>
        <Grid container item className={classes.summaryContent} direction="row">
          <Grid item>
            <Typography>
              {pluralize('CPU Core', 'CPU Cores', numCPUs)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography>{gbRAM} GB RAM</Typography>
          </Grid>
          <Grid item>
            <Typography>{gbStorage} GB Storage</Typography>
          </Grid>
          <Grid item>
            <Typography>{typeLabel}</Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid
        container
        item
        className={classes.accessTableContainer}
        direction="column"
      >
        <Grid item className={classes.columnLabel}>
          Access
        </Grid>
        <Grid item className={classes.accessTableContent}>
          <Table className={classes.accessTable}>
            <TableBody>
              <TableRow>
                <th scope="row">Connection String</th>
                <TableCell className={classes.code}>
                  <InlineTextLoader
                    loading={connectionDetailsLoading}
                    error={
                      connectionDetailsError
                        ? 'There was an error loading the connection string.'
                        : undefined
                    }
                    text={connectionDetailsData?.host}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <th scope="row">Port</th>
                <TableCell className={classes.code}>
                  <InlineTextLoader
                    loading={connectionDetailsLoading}
                    error={
                      connectionDetailsError
                        ? 'There was an error loading the port.'
                        : undefined
                    }
                    text={String(connectionDetailsData?.port)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Grid>
  );
};

// =============================================================================
// Footer
// =============================================================================

interface FooterProps {
  plan: string;
  regionDisplay: string | null;
  id: number;
  created: string;
  tags: string[];
  label: string;
}

const useFooterStyles = makeStyles((theme: Theme) => ({
  details: {
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      marginBottom: 0
    }
  },
  listItem: {
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    color: theme.cmrTextColors.tableStatic,
    padding: `0px 10px`,
    '&:last-of-type': {
      borderRight: 'none'
    }
  },
  label: {
    fontFamily: theme.font.bold
  },
  tags: {
    [theme.breakpoints.down(720)]: {
      marginLeft: theme.spacing(),
      '& > div': {
        flexDirection: 'row-reverse',
        '& > button': {
          marginRight: 4
        }
      }
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const classes = useFooterStyles();

  const { updateDatabase } = useDatabases();
  const { enqueueSnackbar } = useSnackbar();
  const { open, close, isOpen } = useOpenClose();

  const { id, created, tags, label } = props;

  const addTag = React.useCallback(
    (tag: string) => {
      const newTags = [...tags, tag];
      return updateDatabase(id, { tags: newTags }).catch(e =>
        enqueueSnackbar(getAPIErrorOrDefault(e, 'Error adding tag')[0].reason, {
          variant: 'error'
        })
      );
    },
    [tags, id, updateDatabase, enqueueSnackbar]
  );

  const deleteTag = React.useCallback(
    (tag: string) => {
      const newTags = tags.filter(thisTag => thisTag !== tag);
      return updateDatabase(id, { tags: newTags }).catch(e =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error deleting tag')[0].reason,
          {
            variant: 'error'
          }
        )
      );
    },
    [tags, id, updateDatabase, enqueueSnackbar]
  );

  return (
    <>
      <Grid
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <Grid container item className={classes.details} xs={12} sm={8}>
          <Typography className={classes.listItem}>
            <span className={classes.label}>ID:</span> {id}
          </Typography>
          <Typography className={classes.listItem}>
            <span className={classes.label}>Created:</span>{' '}
            {formatDate(created)}
          </Typography>
        </Grid>
        <Grid item className={classes.tags} xs={12} sm={4}>
          <TagCell
            width={500}
            tags={tags}
            addTag={addTag}
            deleteTag={deleteTag}
            listAllTags={open}
          />
        </Grid>
      </Grid>
      <TagDrawer
        open={isOpen}
        onClose={close}
        addTag={addTag}
        deleteTag={deleteTag}
        entityLabel={label}
        tags={tags}
      />
    </>
  );
});
