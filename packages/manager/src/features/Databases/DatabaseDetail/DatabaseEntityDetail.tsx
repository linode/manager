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
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DeleteIcon from 'src/assets/icons/delete.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import ResizeIcon from 'src/assets/icons/resize.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import InlineTextLoader from 'src/components/InlineTextLoader';
import TagCell from 'src/components/TagCell';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useDatabases from 'src/hooks/useDatabases';
import useOpenClose from 'src/hooks/useOpenClose';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';

interface DatabaseEntityDetailProps {
  database: Database;
}

const DatabaseEntityDetail: React.FC<DatabaseEntityDetailProps> = props => {
  const { database } = props;

  const connectionDetails = useAPIRequest<DatabaseConnection | null>(
    () => getDatabaseConnection(database.id),
    null
  );

  return (
    <EntityDetail
      header={<Header label={database.label} status={database.status} />}
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
  );
};

export default React.memo(DatabaseEntityDetail);

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  label: string;
  status: string;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
  },
  distroIcon: {
    fontSize: 25,
    marginRight: 10
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.up('md')]: {
      marginLeft: 'auto',
      padding: `0 !important`
    }
  },
  statusChip: {
    ...theme.applyStatusPillStyles
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
    alignItems: 'center'
  },
  actionItem: {
    marginRight: 0,
    marginBottom: 0,
    maxHeight: 'none',
    padding: `15px 10px`,
    '& svg': {
      height: 20,
      width: 20,
      fill: theme.color.blue,
      color: theme.color.blue,
      marginRight: 10
    },
    '& span': {
      fontFamily: `${theme.font.normal} !important`
    },
    '&:disabled': {
      '& svg': {
        fill: theme.color.disabled
      }
    },
    '&:hover': {
      color: '#ffffff',
      backgroundColor: theme.color.blue,
      '& svg': {
        fill: '#ffffff',
        '& g': {
          stroke: '#ffffff'
        },
        '& path': {
          stroke: '#ffffff'
        }
      }
    },
    '&:focus': {
      outline: '1px dotted #999'
    }
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const { label, status } = props;

  const classes = useHeaderStyles();

  const statusToClass: Record<DatabaseStatus, string> = {
    initializing: classes.statusInitializing,
    ready: classes.statusReady,
    error: classes.statusError,
    unknown: classes.statusUnknown
  };

  return (
    <EntityHeader
      parentLink="/databases"
      parentText="Databases"
      iconType="linode"
      actions={
        <Hidden mdUp>
          <DocumentationButton hideText href="https://www.linode.com/" />
        </Hidden>
      }
      title={label}
      bodyClassName={classes.body}
      body={
        <>
          <Chip
            className={classnames({
              [classes.statusChip]: true,
              [statusToClass[status]]: true,
              statusOtherDetail: ['initializing'].includes(status)
            })}
            label={status.toUpperCase()}
            component="span"
          />

          <div className={classes.actionItemsOuter}>
            {/* @todo: Make the "Resize" button functional. */}
            <IconTextLink
              className={classes.actionItem}
              SideIcon={ResizeIcon}
              text="Resize"
              title="Resize"
            />

            {/* @todo: Make the "Delete" button functional. */}
            <IconTextLink
              className={classes.actionItem}
              SideIcon={DeleteIcon}
              text="Delete"
              title="Delete"
            />
          </div>
          <Hidden smDown>
            <DocumentationButton href="https://www.linode.com/" />
          </Hidden>
        </>
      }
    />
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
  item: {
    '&:last-of-type': {
      paddingBottom: 0
    },
    paddingBottom: 7
  },
  iconsSharedStyling: {
    width: 25,
    height: 25,
    objectFit: 'contain'
  },
  iconSharedOuter: {
    textAlign: 'center',
    justifyContent: 'center',
    flexBasis: '28%',
    display: 'flex'
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
    alignSelf: 'center',
    color: theme.cmrTextColors.tableStatic
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
  accessTable: {
    '& tr': {
      height: 34
    },
    '& td': {
      lineHeight: 1.29,
      fontSize: '0.875rem',
      fontStretch: 'normal',
      letterSpacing: 'normal',
      border: 'none',
      paddingTop: 8,
      paddingRight: 10,
      paddingBottom: 7,
      paddingLeft: 10,
      overflowX: 'auto',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      backgroundColor: theme.cmrBGColors.bgAccessRow,
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`
    },
    '& th': {
      backgroundColor: theme.cmrBGColors.bgAccessHeader,
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`,
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: theme.cmrTextColors.textAccessTable,
      lineHeight: 1.1,
      width: '102px',
      whiteSpace: 'nowrap',
      paddingTop: 8,
      paddingRight: 10,
      paddingBottom: 7,
      paddingLeft: 10,
      textAlign: 'left'
    }
  },
  accessTableContainer: {
    overflowX: 'auto',
    width: '100%'
  },

  code: {
    '& p': {
      fontFamily: '"SourceCodePro", monospace, sans-serif'
    },
    color: theme.cmrTextColors.textAccessCode
  },
  bodyWrapper: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between'
    }
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
    <Grid container direction="row" className={classes.bodyWrapper}>
      <Grid item xs={12} md={5}>
        <Grid container>
          <Grid item>
            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item className={classes.iconSharedOuter}>
                <CPUIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item className={classes.iconTextOuter}>
                <Typography>
                  {pluralize('CPU Core', 'CPU Cores', numCPUs)}
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item className={classes.iconSharedOuter}>
                <RamIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item className={classes.iconTextOuter}>
                <Typography>{gbRAM} GB RAM</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item className={classes.iconSharedOuter}>
                <DiskIcon width={19} height={24} object-fit="contain" />
              </Grid>

              <Grid item className={classes.iconTextOuter}>
                <Typography>{gbStorage} GB Storage</Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item className={classes.iconSharedOuter}>
                <VolumeIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item className={classes.iconTextOuter}>
                <Typography>{typeLabel}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={7}>
        <div className={classes.accessTableContainer}>
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
        </div>
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
  detailsSection: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    '& a': {
      color: theme.color.blue,
      fontFamily: theme.font.bold
    }
  },
  listItem: {
    padding: `0px 10px`,
    borderRight: `1px solid ${theme.color.grey6}`,
    color: theme.color.grey8
  },
  listItemLast: {
    [theme.breakpoints.only('xs')]: {
      borderRight: 'none',
      paddingRight: 0
    }
  },
  button: {
    ...theme.applyLinkStyles,
    borderRight: `1px solid ${theme.color.grey6}`,
    fontSize: '.875rem',
    fontWeight: 'bold',
    paddingLeft: 4,
    paddingRight: 10,
    '&:hover': {
      textDecoration: 'none'
    }
  },
  created: {
    color: theme.color.grey8,
    paddingLeft: 10,
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    [theme.breakpoints.only('xs')]: {
      marginTop: 20,
      marginBottom: 10
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const { id, created, tags, label } = props;

  const classes = useFooterStyles();

  const { open, close, isOpen } = useOpenClose();

  const { updateDatabase } = useDatabases();
  const { enqueueSnackbar } = useSnackbar();

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
        justify="space-between"
        alignItems="center"
      >
        <Grid item xs={12} sm={7}>
          <div className={classes.detailsSection}>
            <Typography
              className={classnames({
                [classes.listItem]: true,
                [classes.listItemLast]: true
              })}
            >
              ID {id}
            </Typography>
            <Hidden xsDown>
              <Typography className={classes.created}>
                Created {formatDate(created, { format: 'dd-LLL-y HH:mm ZZZZ' })}
              </Typography>
            </Hidden>
          </div>
        </Grid>
        <Hidden smUp>
          <Grid item xs={12}>
            <Typography className={classes.created}>
              Created {formatDate(created, { format: 'dd-LLL-y HH:mm ZZZZ' })}
            </Typography>
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={5} className={classes.tags}>
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
