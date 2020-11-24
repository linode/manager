import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import * as classnames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'src/components/Button';
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
import { distroIcons } from 'src/components/ImageSelect/icons';
import TagCell from 'src/components/TagCell';
import { dcDisplayNames } from 'src/constants';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu_CMR';
import { OpenDialog } from 'src/features/linodes/types';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import useImages from 'src/hooks/useImages';
import useLinodes from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { useTypes } from 'src/hooks/useTypes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
import { pluralize } from 'src/utilities/pluralize';
import { lishLink, sshLink } from './LinodesDetail/utilities';

type LinodeEntityDetailVariant = 'dashboard' | 'landing' | 'details';

interface LinodeEntityDetailProps {
  variant: LinodeEntityDetailVariant;
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

export type CombinedProps = LinodeEntityDetailProps;

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
    openNotificationDrawer
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

export default React.memo(LinodeEntityDetail);

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
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgSecondaryActions
  },
  linodeLabelWithDistro: {
    display: 'flex',
    alignItems: 'center'
  },
  linodeLabel: {
    marginLeft: 7,
    color: theme.cmrTextColors.headlineActive
  },
  distroIcon: {
    fontSize: 25,
    marginRight: 10
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    width: '100%'
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    '&.MuiGrid-item': {
      paddingRight: 0
    }
  },
  actionItem: {
    margin: 0,
    marginRight: 10,
    transition: 'none',
    '& svg': {
      height: 20,
      width: 20,
      marginRight: 10
    },
    '& span': {
      fontFamily: `${theme.font.normal} !important`
    },
    '&:disabled': {
      color: theme.color.disabled,
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
  },
  statusChip: {
    ...theme.applyStatusPillStyles,
    marginLeft: theme.spacing()
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
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const {
    variant,
    imageVendor,
    linodeLabel,
    linodeId,
    linodeStatus,
    linodeRegionDisplay,
    openDialog,
    openPowerActionDialog,
    backups,
    type,
    image,
    linodeConfigs,
    isDetailLanding,
    openNotificationDrawer
  } = props;

  const classes = useHeaderStyles();

  const distroIconClassName =
    imageVendor !== null ? `fl-${distroIcons[imageVendor]}` : 'fl-tux';

  const isDetails = variant === 'details';

  const isRunning = linodeStatus === 'running';
  const isOffline = linodeStatus === 'stopped' || linodeStatus === 'offline';
  const isOther = !['running', 'stopped', 'offline'].includes(linodeStatus);

  const handleConsoleButtonClick = (id: number) => {
    sendLinodeActionMenuItemEvent('Launch Console');
    lishLaunch(id);
  };

  return (
    <EntityHeader
      parentLink={isDetails ? '/linodes' : undefined}
      parentText={isDetails ? 'Linodes' : undefined}
      isDetailLanding={isDetailLanding}
      iconType="linode"
      title={
        isDetails ? (
          <div className={classes.linodeLabelWithDistro}>
            <span
              title={imageVendor ?? 'Custom image'}
              className={`${classes.distroIcon} ${distroIconClassName}`}
            />
            {linodeLabel}
          </div>
        ) : (
          <Link to={`linodes/${linodeId}`} className={classes.linodeLabel}>
            {linodeLabel}
          </Link>
        )
      }
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
                [classes.statusRunning]: isRunning,
                [classes.statusOffline]: isOffline,
                [classes.statusOther]: isOther,
                statusOtherDetail: isOther
              })}
              label={linodeStatus.replace('_', ' ').toUpperCase()}
              component="span"
              clickable={isOther ? true : false}
              {...(isOther && { onClick: openNotificationDrawer })}
            />
          </Grid>
          <Grid item className={`${classes.actionItemsOuter} py0`}>
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

            <Hidden smDown>
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
                Launch Console{' '}
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
              noImage={!image}
              inLandingDetailContext={isDetailLanding}
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
  bodyWrapper: {
    padding: theme.spacing(2)
  },
  summaryContainer: {
    flexBasis: '25%',
    [theme.breakpoints.down(1100)]: {
      flexBasis: '50%'
    }
  },
  summaryContent: {
    '& > div': {
      flexBasis: '50%'
    },
    '& p': {
      color: theme.cmrTextColors.tableStatic
    }
  },
  ipContainer: {
    flexBasis: '25%',
    [theme.breakpoints.down(1100)]: {
      flexBasis: '50%'
    }
  },
  ipContent: {
    color: theme.cmrTextColors.tableStatic,
    fontSize: '0.875rem',
    lineHeight: '1rem'
  },
  accessTableContainer: {
    flex: '2 1 50%',
    [theme.breakpoints.down(1100)]: {
      flexBasis: '100%'
    }
  },
  accessTableContent: {
    '&.MuiGrid-item': {
      padding: 0,
      paddingLeft: theme.spacing()
    }
  },
  accessTable: {
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
      whiteSpace: 'nowrap'
    },
    '& td': {
      backgroundColor: theme.cmrBGColors.bgAccessRow,
      border: 'none',
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`,
      fontSize: '0.875rem',
      fontStretch: 'normal',
      letterSpacing: 'normal',
      lineHeight: 1,
      maxWidth: 400,
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

export const Body: React.FC<BodyProps> = React.memo(props => {
  const classes = useBodyStyles();
  const {
    numCPUs,
    gbRAM,
    gbStorage,
    region,
    ipv4,
    ipv6,
    linodeId,
    username,
    linodeLabel,
    numVolumes
  } = props;

  return (
    <Grid container item className={classes.bodyWrapper} direction="row">
      {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
      <Grid
        container
        item
        className={classes.summaryContainer}
        direction="column"
      >
        <Grid item>Summary</Grid>
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

      <Grid container item className={classes.ipContainer} direction="column">
        <Grid item>IP Addresses</Grid>
        <Grid container item className={classes.ipContent} direction="column">
          {ipv4.slice(0, 3).map(thisIP => {
            return (
              <Grid item key={thisIP}>
                {thisIP}
              </Grid>
            );
          })}
          {ipv6 && <Grid item>{ipv6}</Grid>}
          {ipv4.length > 3 && (
            <>
              ... plus{' '}
              <Link to={`/linodes/${linodeId}/networking`}>
                {ipv4.length - 3} more
              </Link>{' '}
            </>
          )}
        </Grid>
      </Grid>

      <Grid
        container
        item
        className={classes.accessTableContainer}
        direction="column"
      >
        <Grid item>Access</Grid>
        <Grid item className={classes.accessTableContent}>
          <Table className={classes.accessTable}>
            <TableBody>
              <TableRow>
                <th scope="row">SSH Access</th>
                <TableCell className={classes.code}>
                  {sshLink(ipv4[0])}
                </TableCell>
              </TableRow>
              <TableRow>
                <th scope="row">LISH via SSH</th>
                <TableCell className={classes.code}>
                  {lishLink(username, region, linodeLabel)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
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
  detailsSection: {
    flexBasis: '66.67%',
    [theme.breakpoints.down(1100)]: {
      flexBasis: '100%',
      '&.MuiGrid-item': {
        paddingTop: theme.spacing(2)
      }
    }
  },
  label: {
    fontFamily: theme.font.bold
  },
  listItem: {
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    color: theme.cmrTextColors.tableStatic,
    padding: `0px 10px`,
    '&:last-of-type': {
      borderRight: 'none'
    }
  },
  linodeTags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexBasis: '33.33%',
    maxWidth: '33.33%',
    [theme.breakpoints.down(1100)]: {
      flexBasis: '100%',
      maxWidth: '100%',
      marginTop: theme.spacing(1.5),
      '& > div': {
        justifyContent: 'flex-end'
      }
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const {
    linodePlan,
    linodeRegionDisplay,
    linodeId,
    linodeCreated,
    linodeTags,
    openTagDrawer
  } = props;

  const classes = useFooterStyles();

  const { updateLinode } = useLinodes();
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
      <Grid container className={classes.detailsSection} item>
        {linodePlan && (
          <Typography className={classes.listItem}>
            <span className={classes.label}>Plan:</span> {linodePlan}
          </Typography>
        )}
        {linodeRegionDisplay && (
          <Typography className={classes.listItem}>
            <span className={classes.label}>Region:</span> {linodeRegionDisplay}
          </Typography>
        )}
        <Typography className={classes.listItem}>
          <span className={classes.label}>Linode ID:</span> {linodeId}
        </Typography>
        <Typography className={classes.listItem}>
          <span className={classes.label}>Created:</span>{' '}
          {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })}
        </Typography>
      </Grid>
      <Grid item className={classes.linodeTags}>
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
