import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import * as classnames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ConsoleIcon from 'src/assets/icons/console.svg';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import RebootIcon from 'src/assets/icons/reboot.svg';
import PowerOnIcon from 'src/assets/icons/power-button.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu_CMR';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
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
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import { distroIcons } from 'src/components/ImageSelect/icons';
import TagCell from 'src/components/TagCell';
import { dcDisplayNames } from 'src/constants';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
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
          type={'something'}
          image={'something'}
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
    alignItems: 'center'
    //justifyContent: 'flex-end',
    // [theme.breakpoints.up('md')]: {
    //   marginLeft: 'auto',
    //   padding: `0 !important`
    // }
  },
  actionItem: {
    marginRight: 10,
    marginBottom: 0,
    padding: '15px 10px',
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
    ...theme.applyStatusPillStyles
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
    isDetailLanding,
    openNotificationDrawer
  } = props;

  const classes = useHeaderStyles();
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

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
              [classes.statusOffline]: isOffline,
              [classes.statusOther]: isOther,
              statusOtherDetail: isOther
            })}
            label={linodeStatus.replace('_', ' ').toUpperCase()}
            component="span"
            clickable={isOther ? true : false}
            {...(isOther && { onClick: openNotificationDrawer })}
          />

          <div>
            <div className={classes.actionItemsOuter}>
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
              />
            </div>
            {isDetails && (
              <Hidden smDown>
                <DocumentationButton href="https://www.linode.com/" />
              </Hidden>
            )}
          </div>
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
    maxWidth: 490
  },
  code: {
    fontFamily: '"SourceCodePro", monospace, sans-serif',
    color: theme.cmrTextColors.textAccessCode
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
              <Link to={`/linodes/${linodeId}/networking`}>
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
      fontFamily: theme.font.bold,
      '&:hover, &:focus': {
        textDecoration: 'underline'
      }
    }
  },
  listItem: {
    padding: `0px 10px`,
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    color: theme.cmrTextColors.tableStatic
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
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    fontSize: '.875rem',
    fontWeight: 'bold'
  },
  linodeCreated: {
    paddingLeft: 10,
    color: theme.cmrTextColors.tableStatic,
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
