import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import * as classnames from 'classnames';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import ConsoleIcon from 'src/assets/icons/console.svg';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import RebootIcon from 'src/assets/icons/reboot.svg';
import ViewDetailsIcon from 'src/assets/icons/viewDetails.svg';
import PowerOnIcon from 'src/assets/icons/power-button.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu_CMR';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import Chip from 'src/components/core/Chip';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import TagCell from 'src/components/TagCell';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import { distroIcons } from 'src/components/ImageSelect/icons';
import { dcDisplayNames } from 'src/constants';
import { OpenDialog } from 'src/features/linodes/types';
import useImages from 'src/hooks/useImages';
import useLinodes from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { useTypes } from 'src/hooks/useTypes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import Hidden from 'src/components/core/Hidden';

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
  isDetailLanding?: boolean;
}

const LinodeEntityDetail: React.FC<LinodeEntityDetailProps> = props => {
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
    openTagDrawer
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
          type={'something'}
          image={'something'}
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
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
  },
  linodeLabelWithDistro: {
    display: 'flex',
    alignItems: 'center'
  },
  linodeLabel: {
    marginLeft: 7,
    color: theme.color.blue
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
  actionItem: {
    marginRight: 10,
    marginBottom: 0,
    padding: 10,
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
    }
  },
  statusChip: {
    ...theme.applyStatusPillStyles
  },
  statusRunning: {
    '&:before': {
      backgroundColor: theme.color.green
    }
  },
  statusOffline: {
    '&:before': {
      backgroundColor: theme.color.grey10
    }
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center'
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
    isDetailLanding
  } = props;

  const classes = useHeaderStyles();
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const distroIconClassName =
    imageVendor !== null ? `fl-${distroIcons[imageVendor]}` : 'fl-tux';

  const isDetails = variant === 'details';

  const isRunning = linodeStatus === 'running';

  const isOffline = linodeStatus === 'stopped' || linodeStatus === 'offline';

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
      actions={
        <Hidden mdUp>
          <DocumentationButton hideText href="https://www.linode.com/" />
        </Hidden>
      }
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
        <>
          <Chip
            className={classnames({
              [classes.statusChip]: true,
              [classes.statusRunning]: isRunning,
              [classes.statusOffline]: isOffline
            })}
            label={linodeStatus.toUpperCase()}
            component="span"
            clickable={false}
          />

          <div className={classes.actionItemsOuter}>
            {!isDetails && (
              <Hidden smDown>
                <IconTextLink
                  className={classes.actionItem}
                  SideIcon={ViewDetailsIcon}
                  text="View Details"
                  title="View Details"
                  to={`linodes/${linodeId}`}
                />
              </Hidden>
            )}

            <IconTextLink
              className={classes.actionItem}
              SideIcon={PowerOnIcon}
              text={linodeStatus === 'running' ? 'Power Off' : 'Power On'}
              title={linodeStatus === 'running' ? 'Power Off' : 'Power On'}
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
              disabled={!['running', 'offline'].includes(linodeStatus)}
            />

            <Hidden smDown>
              <IconTextLink
                className={classes.actionItem}
                SideIcon={RebootIcon}
                disabled={linodeStatus === 'offline'}
                text="Reboot"
                title="Reboot"
                onClick={() => {
                  sendLinodeActionMenuItemEvent('Reboot Linode');
                  openPowerActionDialog(
                    'Reboot',
                    linodeId,
                    linodeLabel,
                    linodeConfigs
                  );
                }}
              />

              <IconTextLink
                className={classes.actionItem}
                SideIcon={ConsoleIcon}
                text="Launch Console"
                title="Launch Console"
                onClick={() => {
                  handleConsoleButtonClick(linodeId);
                }}
              />
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
              inlineLabel={matchesMdDown ? undefined : 'More Actions'}
              inLandingDetailContext={isDetailLanding}
            />
          </div>
          {isDetails && (
            <Hidden smDown>
              <DocumentationButton href="https://www.linode.com/" />
            </Hidden>
          )}
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
  region: string;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  linodeId: number;
  username: string;
  linodeLabel: string;
  numVolumes: number;
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
    alignSelf: 'center'
  },
  ipContainer: {
    paddingLeft: '40px !important'
  },
  ipList: {
    marginTop: 4,
    '& li': {
      padding: 0,
      fontSize: '0.875rem',
      lineHeight: 1.43
    }
  },
  // @todo: use mixin for this button reset (M3-4270)
  button: {
    backgroundColor: 'inherit',
    border: 'none',
    fontSize: 'inherit',
    fontFamily: theme.font.semiBold,
    color: theme.color.blue,
    padding: 0,
    cursor: 'pointer'
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
      backgroundColor: theme.color.grey7,
      borderBottom: '1px solid white'
    },
    '& th': {
      backgroundColor: theme.color.grey5,
      borderBottom: '1px solid white',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: '#606469',
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
    maxWidth: 335,
    [theme.breakpoints.up('md')]: {
      maxWidth: 728
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 600
    }
  },
  code: {
    // @todo: use font from designs
    fontFamily: '"Ubuntu Mono", monospace, sans-serif'
  },
  bodyWrapper: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between'
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
    linodeId,
    username,
    linodeLabel,
    numVolumes
  } = props;

  return (
    <Grid container direction="row" className={classes.bodyWrapper}>
      <Grid item>
        {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
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
                <Typography>{gbRAM} RAM</Typography>
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
                <Typography>
                  {pluralize('Volume', 'Volumes', numVolumes)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <List className={classes.ipList}>
          {ipv4.slice(0, 3).map(thisIP => {
            return <ListItem key={thisIP}>{thisIP}</ListItem>;
          })}
          {ipv6 && <ListItem>{ipv6}</ListItem>}
          {ipv4.length > 3 && (
            <>
              ... plus{' '}
              <Link to={`linodes/${linodeId}/networking`}>
                {ipv4.length - 3} more
              </Link>{' '}
            </>
          )}
        </List>
      </Grid>
      <Grid item>
        <div className={classes.accessTableContainer}>
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
        </div>
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
    padding: `0px 10px`,
    borderRight: `1px solid ${theme.color.grey6}`,
    fontWeight: 'bold',
    '&:hover': {
      textDecoration: 'none'
    }
  },
  linodeCreated: {
    paddingLeft: 10,
    color: theme.color.grey8,
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  linodeTags: {
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
  const {
    linodePlan,
    linodeRegionDisplay,
    linodeId,
    linodeCreated,
    linodeTags,
    openTagDrawer,
    openDialog
  } = props;

  const _openMigrateDialog = React.useCallback(() => {
    openDialog('migrate', linodeId);
  }, [linodeId, openDialog]);

  const _openResizeDialog = React.useCallback(() => {
    openDialog('resize', linodeId);
  }, [linodeId, openDialog]);

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
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Grid item xs={12} sm={7}>
        <div className={classes.detailsSection}>
          {linodePlan && (
            <button onClick={_openResizeDialog} className={classes.button}>
              {linodePlan} Plan
            </button>
          )}
          {linodeRegionDisplay && (
            <button onClick={_openMigrateDialog} className={classes.button}>
              {linodeRegionDisplay}
            </button>
          )}
          <Typography
            className={classnames({
              [classes.listItem]: true,
              [classes.listItemLast]: true
            })}
          >
            Linode ID {linodeId}
          </Typography>
          <Hidden xsDown>
            <Typography className={classes.linodeCreated}>
              Created{' '}
              {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })}
            </Typography>
          </Hidden>
        </div>
      </Grid>
      <Hidden smUp>
        <Grid item xs={12}>
          <Typography className={classes.linodeCreated}>
            Created{' '}
            {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })}
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={5} className={classes.linodeTags}>
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
