import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import * as classnames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import CopyTooltip from 'src/components/CopyTooltip';
import Box from 'src/components/core/Box';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid, { GridProps } from 'src/components/Grid';
import TagCell from 'src/components/TagCell';
import { dcDisplayNames } from 'src/constants';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRow';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { OpenDialog } from 'src/features/linodes/types';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import useImages from 'src/hooks/useImages';
import useLinodeActions from 'src/hooks/useLinodeActions';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { useTypes } from 'src/hooks/useTypes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
import { pluralize } from 'src/utilities/pluralize';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeNetworking_CMR';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import withRecentEvent, {
  WithRecentEvent
} from './LinodesLanding/withRecentEvent';
import {
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
  transitionText as _transitionText
} from './transitions';

type LinodeEntityDetailVariant = 'dashboard' | 'landing' | 'details';

interface LinodeEntityDetailProps {
  variant: LinodeEntityDetailVariant;
  id: number;
  linode: Linode;
  username?: string;
  openDialog: OpenDialog;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  backups: LinodeBackups;
  linodeConfigs: Config[];
  numVolumes: number;
  openTagDrawer: (tags: string[]) => void;
  openNotificationDrawer?: () => void;
  isDetailLanding?: boolean;
}

export type CombinedProps = LinodeEntityDetailProps & WithRecentEvent;

const LinodeEntityDetail: React.FC<CombinedProps> = props => {
  const {
    variant,
    linode,
    username,
    openDialog,
    openPowerActionDialog,
    backups,
    linodeConfigs,
    numVolumes,
    isDetailLanding,
    openTagDrawer,
    openNotificationDrawer,
    recentEvent
  } = props;

  useReduxLoad(['images', 'types']);
  const { images } = useImages();
  const { types } = useTypes();

  const imageSlug = linode.image;

  const imageVendor =
    imageSlug && images.itemsById[imageSlug]
      ? images.itemsById[imageSlug].vendor
      : null;

  const linodeType = Boolean(linode.type)
    ? types.entities.find(thisType => thisType.id === linode.type) ?? null
    : null;

  const linodePlan = linodeType?.label ?? null;

  const linodeRegionDisplay = dcDisplayNames[linode.region] ?? null;

  let progress;
  let transitionText;
  if (recentEvent && isEventWithSecondaryLinodeStatus(recentEvent, linode.id)) {
    progress = getProgressOrDefault(recentEvent);
    transitionText = _transitionText(linode.status, linode.id, recentEvent);
  }

  return (
    <EntityDetail
      header={
        <Header
          variant={variant}
          imageVendor={imageVendor}
          linodeLabel={linode.label}
          linodeId={linode.id}
          linodeStatus={linode.status}
          openDialog={openDialog}
          openPowerActionDialog={openPowerActionDialog}
          linodeRegionDisplay={linodeRegionDisplay}
          backups={backups}
          linodeConfigs={linodeConfigs}
          isDetailLanding={isDetailLanding}
          type={''}
          image={''}
          openNotificationDrawer={openNotificationDrawer || (() => null)}
          progress={progress}
          transitionText={transitionText}
        />
      }
      body={
        <Body
          linodeLabel={linode.label}
          numVolumes={numVolumes}
          numCPUs={linode.specs.vcpus}
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          region={linode.region}
          ipv4={linode.ipv4}
          ipv6={linode.ipv6}
          linodeId={linode.id}
          username={username ? username : 'none'}
        />
      }
      footer={
        <Footer
          linodePlan={linodePlan}
          linodeRegionDisplay={linodeRegionDisplay}
          linodeId={linode.id}
          linodeCreated={linode.created}
          linodeTags={linode.tags}
          linodeLabel={linode.label}
          openTagDrawer={openTagDrawer}
          openDialog={openDialog}
        />
      }
    />
  );
};

const enhanced = compose<CombinedProps, LinodeEntityDetailProps>(
  withRecentEvent,
  React.memo
);

export default enhanced(LinodeEntityDetail);

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  variant: LinodeEntityDetailVariant;
  imageVendor: string | null;
  linodeLabel: string;
  linodeId: number;
  linodeStatus: Linode['status'];
  openDialog: OpenDialog;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  linodeRegionDisplay: string;
  backups: LinodeBackups;
  type: string;
  image: string;
  linodeConfigs: Config[];
  isDetailLanding?: boolean;
  openNotificationDrawer: () => void;
  progress?: number;
  transitionText?: string;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgPaper
  },
  linodeLabel: {
    color: theme.cmrTextColors.linkActiveLight,
    marginLeft: theme.spacing(),
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline'
    }
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    width: '100%'
  },
  chipWrapper: {
    [theme.breakpoints.up('sm')]: {
      '&.MuiGrid-item': {
        marginTop: 2
      }
    }
  },
  statusChip: {
    ...theme.applyStatusPillStyles,
    borderRadius: 0,
    height: `24px !important`,
    marginLeft: theme.spacing(2)
  },
  statusChipLandingDetailView: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  },
  statusRunning: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGreen
    }
  },
  statusOffline: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGrey
    }
  },
  statusOther: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iOrange
    }
  },
  divider: {
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    paddingRight: `16px !important`
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    '&.MuiGrid-item': {
      paddingRight: 0
    }
  },
  actionItem: {
    '&:focus': {
      outline: '1px dotted #999'
    }
  },
  statusLink: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    '& p': {
      color: theme.palette.primary.main,
      fontFamily: theme.font.bold
    }
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const classes = useHeaderStyles();

  const {
    variant,
    linodeLabel,
    linodeId,
    linodeStatus,
    linodeRegionDisplay,
    openDialog,
    openPowerActionDialog,
    backups,
    type,
    linodeConfigs,
    isDetailLanding,
    progress,
    transitionText,
    openNotificationDrawer
  } = props;

  const isDetails = variant === 'details';

  const isRunning = linodeStatus === 'running';
  const isOffline = linodeStatus === 'stopped' || linodeStatus === 'offline';
  const isOther = !['running', 'stopped', 'offline'].includes(linodeStatus);

  const handleConsoleButtonClick = (id: number) => {
    sendLinodeActionMenuItemEvent('Launch Console');
    lishLaunch(id);
  };

  const formattedStatus = linodeStatus.replace('_', ' ').toUpperCase();
  const formattedTransitionText = (transitionText ?? '').toUpperCase();

  const hasSecondaryStatus =
    typeof progress !== 'undefined' &&
    typeof transitionText !== 'undefined' &&
    // Kind of a hacky way to avoid "CLONING | CLONING (50%)" until we add logic
    // to display "Cloning to 'destination-linode'.
    formattedTransitionText !== formattedStatus;

  return (
    <EntityHeader
      parentLink={isDetails ? '/linodes' : undefined}
      parentText={isDetails ? 'Linodes' : undefined}
      isDetailLanding={isDetailLanding}
      title={
        <Link to={`linodes/${linodeId}`} className={classes.linodeLabel}>
          {linodeLabel}
        </Link>
      }
      bodyClassName={classes.body}
      body={
        <Grid
          container
          className="m0"
          alignItems="center"
          justify="space-between"
        >
          <Box display="flex" alignItems="center">
            <Grid
              item
              className={`p0 ${isDetailLanding && classes.chipWrapper}`}
            >
              <Chip
                className={classnames({
                  [classes.statusChip]: true,
                  [classes.statusChipLandingDetailView]: isDetailLanding,
                  [classes.statusRunning]: isRunning,
                  [classes.statusOffline]: isOffline,
                  [classes.statusOther]: isOther,
                  [classes.divider]: hasSecondaryStatus,
                  statusOtherDetail: isOther
                })}
                label={formattedStatus}
                component="span"
                {...isOther}
              />
            </Grid>
            {hasSecondaryStatus ? (
              <Grid
                item
                className="py0"
                style={{ marginLeft: 16, marginBottom: 2 }}
              >
                <button
                  className={classes.statusLink}
                  onClick={openNotificationDrawer}
                >
                  <ProgressDisplay
                    progress={progress ?? 0}
                    text={formattedTransitionText}
                  />
                </button>
              </Grid>
            ) : null}
          </Box>
          <Grid item className={`${classes.actionItemsOuter} py0`}>
            <Hidden smDown>
              <Button
                buttonType="secondary"
                className={classes.actionItem}
                disabled={!['running', 'offline'].includes(linodeStatus)}
                onClick={() => {
                  const action =
                    linodeStatus === 'running' ? 'Power Off' : 'Power On';
                  sendLinodeActionMenuItemEvent(`${action} Linode`);

                  openPowerActionDialog(
                    `${action}` as BootAction,
                    linodeId,
                    linodeLabel,
                    linodeStatus === 'running' ? linodeConfigs : []
                  );
                }}
              >
                {linodeStatus === 'running' ? 'Power Off' : 'Power On'}
              </Button>
              <Button
                buttonType="secondary"
                className={classes.actionItem}
                disabled={linodeStatus === 'offline'}
                onClick={() => {
                  sendLinodeActionMenuItemEvent('Reboot Linode');
                  openPowerActionDialog(
                    'Reboot',
                    linodeId,
                    linodeLabel,
                    linodeConfigs
                  );
                }}
              >
                Reboot
              </Button>
              <Button
                buttonType="secondary"
                className={classes.actionItem}
                onClick={() => {
                  handleConsoleButtonClick(linodeId);
                }}
              >
                Launch LISH Console
              </Button>
            </Hidden>

            <LinodeActionMenu
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeRegion={linodeRegionDisplay}
              linodeType={type}
              linodeStatus={linodeStatus}
              linodeBackups={backups}
              openDialog={openDialog}
              openPowerActionDialog={openPowerActionDialog}
            />
          </Grid>
        </Grid>
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
  region: string;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  linodeId: number;
  username: string;
  linodeLabel: string;
  numVolumes: number;
}

const useBodyStyles = makeStyles((theme: Theme) => ({
  body: {
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    padding: theme.spacing(2)
  },
  columnLabel: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold
  },
  summaryContainer: {
    flexBasis: '25%'
  },
  summaryContent: {
    '& > div': {
      flexBasis: '50%',
      [theme.breakpoints.down('sm')]: {
        flexBasis: '100%'
      }
    },
    '& p': {
      color: theme.cmrTextColors.tableStatic
    }
  },
  rightColumn: {
    flexBasis: '75%',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  }
}));

export const Body: React.FC<BodyProps> = React.memo(props => {
  const classes = useBodyStyles();
  const {
    numCPUs,
    gbRAM,
    gbStorage,
    region,
    ipv4,
    ipv6,
    username,
    linodeLabel,
    linodeId,
    numVolumes
  } = props;

  const numIPAddresses = ipv4.length + (ipv6 ? 1 : 0);

  const firstAddress = ipv4[0];

  // If IPv6 is enabled, always use it in the second address slot. Otherwise use
  // the second IPv4 address if it exists.
  const secondAddress = ipv6 ? ipv6 : ipv4.length > 1 ? ipv4[1] : null;

  return (
    <Grid container item className={classes.body} direction="row">
      {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
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
            <Typography>{gbStorage} GB Storage</Typography>
          </Grid>
          <Grid item>
            <Typography>{gbRAM} GB RAM</Typography>
          </Grid>
          <Grid item>
            <Typography>
              {pluralize('Volume', 'Volumes', numVolumes)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid
        container
        item
        className={classes.rightColumn}
        direction="row"
        justify="space-between"
      >
        <AccessTable
          title={`IP Address${numIPAddresses > 1 ? 'es' : ''}`}
          rows={[{ text: firstAddress }, { text: secondAddress }]}
          footer={
            numIPAddresses > 2 ? (
              <Typography variant="body1">
                <HashLink to={`/linodes/${linodeId}/networking#${ipv4TableID}`}>
                  View all IP Addresses
                </HashLink>
              </Typography>
            ) : (
              undefined
            )
          }
          gridProps={{ md: 5 }}
        />

        <AccessTable
          title="Access"
          rows={[
            { heading: 'SSH Access', text: sshLink(ipv4[0]) },
            {
              heading: 'LISH Console via SSH',
              text: lishLink(username, region, linodeLabel)
            }
          ]}
          gridProps={{ md: 7 }}
        />
      </Grid>
    </Grid>
  );
});

// =============================================================================
// AccessTable
// =============================================================================
// @todo: Maybe move this component somewhere to its own file? Could potentially
// be used elsewhere.
const useAccessTableStyles = makeStyles((theme: Theme) => ({
  columnLabel: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold
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
      height: 32
    },
    '& th': {
      backgroundColor: theme.cmrBGColors.bgApp,
      borderBottom: `1px solid ${theme.cmrBGColors.bgPaper}`,
      color: theme.cmrTextColors.textAccessTable,
      fontSize: '0.875rem',
      fontWeight: 'bold',
      lineHeight: 1,
      padding: theme.spacing(),
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: 170
    },
    '& td': {
      backgroundColor: theme.cmrBGColors.bgAccessRow,
      border: 'none',
      borderBottom: `1px solid ${theme.cmrBGColors.bgPaper}`,
      fontSize: '0.875rem',
      lineHeight: 1,
      padding: theme.spacing(),
      whiteSpace: 'nowrap'
    }
  },
  code: {
    color: theme.cmrTextColors.tableStatic,
    fontFamily: '"SourceCodePro", monospace, sans-serif',
    position: 'relative'
  },
  copyCell: {
    width: 36,
    height: 33,
    backgroundColor: `${theme.cmrBGColors.bgSecondaryButton} !important`,
    padding: '0px !important',
    '& svg': {
      width: 16,
      height: 16,
      '& path': {
        fill: theme.cmrBorderColors.borderBalance
      }
    },
    '& button': {
      padding: 0
    },
    '&:last-child': {
      paddingRight: theme.spacing()
    }
  },
  copyButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  gradient: {
    overflowY: 'hidden', // For Edge
    overflowX: 'auto',
    paddingRight: 15,
    '&:after': {
      content: '""',
      width: 30,
      height: '100%',
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundImage: `linear-gradient(to right,  ${theme.cmrBGColors.bgAccessRowTransparentGradient}, ${theme.cmrBGColors.bgAccessRow});`
    }
  }
}));

interface AccessTableRow {
  text: string | null;
  heading?: string;
}

interface AccessTableProps {
  title: string;
  rows: AccessTableRow[];
  gridProps?: GridProps;
  footer?: JSX.Element;
}

export const AccessTable: React.FC<AccessTableProps> = React.memo(props => {
  const classes = useAccessTableStyles();
  return (
    <Grid container item md={6} direction="column" {...props.gridProps}>
      <Grid item className={classes.columnLabel}>
        {props.title}
      </Grid>
      <Grid item className={classes.accessTableContent}>
        <Table className={classes.accessTable}>
          <TableBody>
            {props.rows.map(thisRow => {
              return thisRow.text ? (
                <TableRow key={thisRow.text}>
                  {thisRow.heading ? (
                    <th scope="row">{thisRow.heading}</th>
                  ) : null}
                  <TableCell className={classes.code}>
                    <div className={classes.gradient}>{thisRow.text}</div>
                  </TableCell>
                  <TableCell className={classes.copyCell}>
                    <CopyTooltip
                      text={thisRow.text}
                      className={classes.copyButton}
                    />
                  </TableCell>
                </TableRow>
              ) : null;
            })}
          </TableBody>
        </Table>
        {props.footer ? <Grid item>{props.footer}</Grid> : null}
      </Grid>
    </Grid>
  );
});

// =============================================================================
// Footer
// =============================================================================
interface FooterProps {
  linodePlan: string | null;
  linodeRegionDisplay: string | null;
  linodeId: number;
  linodeCreated: string;
  linodeTags: string[];
  linodeLabel: string;
  openTagDrawer: (tags: string[]) => void;
  openDialog: OpenDialog;
}

const useFooterStyles = makeStyles((theme: Theme) => ({
  details: {
    flexWrap: 'nowrap',
    '&.MuiGrid-item': {
      paddingRight: 0
    },
    [theme.breakpoints.up(1400)]: {
      flexBasis: '66.67%',
      flexGrow: 0,
      maxWidth: '66.67%'
    },
    [theme.breakpoints.down(1400)]: {
      marginTop: 0,
      marginBottom: 0
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'stretch',
      flexDirection: 'column'
    }
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      '&:first-of-type': {
        paddingBottom: theme.spacing(0.5)
      }
    }
  },
  listItem: {
    display: 'flex',
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    color: theme.cmrTextColors.tableStatic,
    padding: `0px 10px`,
    [theme.breakpoints.down('sm')]: {
      flex: '50%',
      borderRight: 'none',
      paddingRight: 0
    }
  },
  listItemLast: {
    borderRight: 'none',
    paddingRight: 0
  },
  label: {
    fontFamily: theme.font.bold,
    marginRight: 4
  },
  tags: {
    [theme.breakpoints.up(1400)]: {
      flexBasis: '33.33%',
      flexGrow: 0,
      maxWidth: '33.33%'
    },
    [theme.breakpoints.down(1400)]: {
      marginLeft: theme.spacing(),
      '& > div': {
        flexDirection: 'row-reverse',
        '& > button': {
          marginRight: 4
        },
        '& > div': {
          justifyContent: 'flex-start !important'
        }
      }
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const classes = useFooterStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    linodePlan,
    linodeRegionDisplay,
    linodeId,
    linodeCreated,
    linodeTags,
    openTagDrawer
  } = props;

  const { updateLinode } = useLinodeActions();
  const { enqueueSnackbar } = useSnackbar();

  const addTag = React.useCallback(
    (tag: string) => {
      const newTags = [...linodeTags, tag];
      updateLinode({ linodeId, tags: newTags }).catch(e =>
        enqueueSnackbar(getAPIErrorOrDefault(e, 'Error adding tag')[0].reason, {
          variant: 'error'
        })
      );
    },
    [linodeTags, linodeId, updateLinode, enqueueSnackbar]
  );

  const deleteTag = React.useCallback(
    (tag: string) => {
      const newTags = linodeTags.filter(thisTag => thisTag !== tag);
      updateLinode({ linodeId, tags: newTags }).catch(e =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error deleting tag')[0].reason,
          {
            variant: 'error'
          }
        )
      );
    },
    [linodeTags, linodeId, updateLinode, enqueueSnackbar]
  );

  return (
    <Grid container direction="row" alignItems="center" justify="space-between">
      <Grid
        container
        item
        className={classes.details}
        alignItems="flex-start"
        md={12}
      >
        <div className={classes.detailRow}>
          {linodePlan && (
            <Typography className={classes.listItem}>
              <span className={classes.label}>Plan: </span> {linodePlan}
            </Typography>
          )}
          {linodeRegionDisplay && (
            <Typography
              className={classnames({
                [classes.listItem]: true,
                [classes.listItemLast]: matchesSmDown
              })}
            >
              <span className={classes.label}>Region:</span>{' '}
              {linodeRegionDisplay}
            </Typography>
          )}
        </div>
        <div className={classes.detailRow}>
          <Typography className={classes.listItem}>
            <span className={classes.label}>Linode ID:</span> {linodeId}
          </Typography>
          <Typography className={`${classes.listItem} ${classes.listItemLast}`}>
            <span className={classes.label}>Created:</span>{' '}
            {formatDate(linodeCreated)}
          </Typography>
        </div>
      </Grid>
      <Grid item className={classes.tags} md={12}>
        <TagCell
          width={500}
          tags={linodeTags}
          addTag={addTag}
          deleteTag={deleteTag}
          listAllTags={openTagDrawer}
        />
      </Grid>
    </Grid>
  );
});
