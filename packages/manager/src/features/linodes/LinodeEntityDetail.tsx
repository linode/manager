import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import classNames from 'classnames';
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
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import Grid, { GridProps } from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
import TagCell from 'src/components/TagCell';
import LinodeActionMenu from 'src/features/linodes/LinodesLanding/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRow';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { OpenDialog } from 'src/features/linodes/types';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import useLinodeActions from 'src/hooks/useLinodeActions';
import { useSpecificTypes } from 'src/queries/types';
import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
import { pluralize } from 'src/utilities/pluralize';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeNetworking';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import EntityHeader from 'src/components/EntityHeader';
import withRecentEvent, {
  WithRecentEvent,
} from './LinodesLanding/withRecentEvent';
import {
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
  transitionText as _transitionText,
} from './transitions';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import { GrantLevel } from '@linode/api-v4/lib/account';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import { useTheme } from '@mui/material/styles';

interface LinodeEntityDetailProps {
  variant?: TypographyProps['variant'];
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
  openNotificationMenu?: () => void;
  isSummaryView?: boolean;
}

interface StatusChange {
  linodeConfigs: Config[];
  linodeId: number;
  linodeLabel: string;
  status: BootAction;
}

export type CombinedProps = LinodeEntityDetailProps & WithRecentEvent;

const LinodeEntityDetail: React.FC<CombinedProps> = (props) => {
  const {
    variant,
    linode,
    username,
    openDialog,
    openPowerActionDialog,
    backups,
    linodeConfigs,
    isSummaryView,
    numVolumes,
    openTagDrawer,
    openNotificationMenu,
    recentEvent,
  } = props;

  const { data: images } = useAllImagesQuery({}, {});
  const imagesItemsById = listToItemsByID(images ?? []);

  const typesQuery = useSpecificTypes(linode.type ? [linode.type] : []);
  const type = typesQuery[0]?.data ? extendType(typesQuery[0].data) : undefined;

  const extendedLinode = useExtendedLinode(linode.id);

  const { data: regions } = useRegionsQuery();

  const imageSlug = linode.image;

  const imageVendor =
    imageSlug && imagesItemsById[imageSlug]
      ? imagesItemsById[imageSlug].vendor
      : null;

  const linodeType = Boolean(linode.type) ? type ?? null : null;

  const linodePlan = linodeType?.formattedLabel ?? null;

  const linodeRegionDisplay =
    regions?.find((r) => r.id === linode.region)?.label ?? linode.region;

  let progress;
  let transitionText;
  if (recentEvent && isEventWithSecondaryLinodeStatus(recentEvent, linode.id)) {
    progress = getProgressOrDefault(recentEvent);
    transitionText = _transitionText(linode.status, linode.id, recentEvent);
  }
  const trimmedIPv6 = linode.ipv6?.replace('/128', '') || null;

  return (
    <EntityDetail
      header={
        <Header
          variant={variant}
          imageVendor={imageVendor}
          linodeLabel={linode.label}
          linodeId={linode.id}
          linodeStatus={linode.status}
          linodePermissions={extendedLinode?._permissions}
          openDialog={openDialog}
          openPowerActionDialog={openPowerActionDialog}
          linodeRegionDisplay={linodeRegionDisplay}
          backups={backups}
          isSummaryView={isSummaryView}
          linodeConfigs={linodeConfigs}
          type={linodeType}
          image={linode.image ?? 'Unknown Image'}
          openNotificationMenu={openNotificationMenu || (() => null)}
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
          ipv6={trimmedIPv6}
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
  variant?: TypographyProps['variant'];
  imageVendor: string | null;
  linodeLabel: string;
  linodeId: number;
  linodeStatus: Linode['status'];
  linodePermissions?: GrantLevel;
  openDialog: OpenDialog;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  linodeRegionDisplay: string;
  backups: LinodeBackups;
  type: ExtendedType | null;
  image: string;
  linodeConfigs: Config[];
  isSummaryView?: boolean;
  openNotificationMenu: () => void;
  progress?: number;
  transitionText?: string;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.bgPaper,
  },
  linodeLabel: {
    color: theme.textColors.linkActiveLight,
    marginLeft: theme.spacing(),
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline',
    },
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    width: '100%',
  },
  chipWrapper: {
    [theme.breakpoints.up('sm')]: {
      '&.MuiGrid-item': {
        marginTop: 2,
      },
    },
  },
  statusChip: {
    ...theme.applyStatusPillStyles,
    fontSize: '0.875rem',
    letterSpacing: '.5px',
    borderRadius: 0,
    height: `24px !important`,
    marginLeft: theme.spacing(2),
  },
  statusChipLandingDetailView: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
  },
  statusRunning: {
    '&:before': {
      backgroundColor: theme.color.teal,
    },
  },
  statusOffline: {
    '&:before': {
      backgroundColor: theme.color.grey8,
    },
  },
  statusOther: {
    '&:before': {
      backgroundColor: theme.color.orange,
    },
  },
  divider: {
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    paddingRight: `16px !important`,
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    '&.MuiGrid-item': {
      paddingRight: 0,
    },
  },
}));

const Header: React.FC<HeaderProps> = (props) => {
  const classes = useHeaderStyles();
  const theme = useTheme();

  const {
    linodeLabel,
    linodeId,
    linodeStatus,
    linodeRegionDisplay,
    openDialog,
    openPowerActionDialog,
    backups,
    type,
    variant,
    linodeConfigs,
    isSummaryView,
    progress,
    transitionText,
    openNotificationMenu,
  } = props;

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

  const sxActionItem = {
    color: theme.textColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '0.875rem',
    height: theme.spacing(5),
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: theme.color.blueDTwhite,
      color: theme.color.white,
    },
  };

  const sxBoxFlex = {
    alignItems: 'center',
    display: 'flex',
  };

  const handleStatusChange = ({
    linodeConfigs,
    linodeId,
    linodeLabel,
    status,
  }: StatusChange) => {
    sendLinodeActionMenuItemEvent(`${status} Linode`);
    openPowerActionDialog(status, linodeId, linodeLabel, linodeConfigs);
  };

  return (
    <EntityHeader
      title={
        <Link to={`linodes/${linodeId}`} className={classes.linodeLabel}>
          {linodeLabel}
        </Link>
      }
      variant={variant}
      isSummaryView={isSummaryView}
    >
      <Box sx={sxBoxFlex}>
        <Chip
          data-qa-linode-status
          className={classNames({
            [classes.statusChip]: true,
            [classes.statusChipLandingDetailView]: isSummaryView,
            [classes.statusRunning]: isRunning,
            [classes.statusOffline]: isOffline,
            [classes.statusOther]: isOther,
            [classes.divider]: hasSecondaryStatus,
            statusOtherDetail: isOther,
          })}
          label={formattedStatus}
          component="span"
        />
        {hasSecondaryStatus ? (
          <Button
            buttonType="secondary"
            onClick={openNotificationMenu}
            sx={{ minWidth: '64px' }}
          >
            <ProgressDisplay
              progress={progress ?? 0}
              sx={{ color: 'primary.main', fontFamily: theme.font.bold }}
              text={formattedTransitionText}
            />
          </Button>
        ) : null}
      </Box>
      <Box sx={sxBoxFlex}>
        <Hidden mdDown>
          <Button
            buttonType="secondary"
            sx={sxActionItem}
            disabled={!(isRunning || isOffline)}
            onClick={() =>
              handleStatusChange({
                linodeConfigs,
                linodeId,
                linodeLabel,
                status: isRunning ? 'Power Off' : 'Power On',
              })
            }
          >
            {isRunning ? 'Power Off' : 'Power On'}
          </Button>
          <Button
            buttonType="secondary"
            sx={sxActionItem}
            disabled={isOffline}
            onClick={() =>
              handleStatusChange({
                linodeConfigs,
                linodeId,
                linodeLabel,
                status: 'Reboot',
              })
            }
          >
            Reboot
          </Button>
          <Button
            buttonType="secondary"
            sx={sxActionItem}
            onClick={() => {
              handleConsoleButtonClick(linodeId);
            }}
          >
            Launch LISH Console
          </Button>
        </Hidden>

        <LinodeActionMenu
          linodeBackups={backups}
          linodeId={linodeId}
          linodeLabel={linodeLabel}
          linodeRegion={linodeRegionDisplay}
          linodeStatus={linodeStatus}
          linodeType={type ?? undefined}
          openDialog={openDialog}
          openPowerActionDialog={openPowerActionDialog}
        />
      </Box>
    </EntityHeader>
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
    padding: theme.spacing(2),
  },
  columnLabel: {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  summaryContainer: {
    flexBasis: '25%',
  },
  summaryContent: {
    '& > div': {
      flexBasis: '50%',
      [theme.breakpoints.down('md')]: {
        flexBasis: '100%',
      },
    },
    '& p': {
      color: theme.textColors.tableStatic,
    },
  },
  rightColumn: {
    flexBasis: '75%',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
}));

export const Body: React.FC<BodyProps> = React.memo((props) => {
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
    numVolumes,
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
        justifyContent="space-between"
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
            ) : undefined
          }
          gridProps={{ md: 5 }}
        />

        <AccessTable
          title="Access"
          rows={[
            { heading: 'SSH Access', text: sshLink(ipv4[0]) },
            {
              heading: 'LISH Console via SSH',
              text: lishLink(username, region, linodeLabel),
            },
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
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  accessTableContent: {
    '&.MuiGrid-item': {
      padding: 0,
      paddingLeft: theme.spacing(),
    },
  },
  accessTable: {
    tableLayout: 'fixed',
    '& tr': {
      height: 32,
    },
    '& th': {
      backgroundColor: theme.bg.app,
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      color: theme.textColors.textAccessTable,
      fontSize: '0.875rem',
      fontWeight: 'bold',
      lineHeight: 1,
      padding: theme.spacing(),
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: 170,
    },
    '& td': {
      border: 'none',
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      fontSize: '0.875rem',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },
  },
  code: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bg.bgAccessRow,
    color: theme.textColors.tableStatic,
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    padding: '4px 8px',
    position: 'relative',
    '& div': {
      fontSize: 15,
    },
  },
  row: {
    '&:hover $copy > svg, & $copy:focus > svg': {
      opacity: 1,
    },
  },
  copyCell: {
    backgroundColor: theme.bg.lightBlue2,
    height: 33,
    width: 36,
    padding: 0,
    '& svg': {
      height: 16,
      width: 16,
      '& path': {
        fill: theme.textColors.linkActiveLight,
      },
    },
    '&:hover': {
      backgroundColor: '#3683dc',
      '& svg path': {
        fill: '#fff',
      },
    },
  },
  copy: {
    '& svg': {
      height: `12px`,
      width: `12px`,
      opacity: 0,
    },
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
      backgroundImage: `linear-gradient(to right,  ${theme.bg.bgAccessRowTransparentGradient}, ${theme.bg.bgAccessRow});`,
    },
  },
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

export const AccessTable: React.FC<AccessTableProps> = React.memo((props) => {
  const classes = useAccessTableStyles();
  return (
    <Grid container item md={6} direction="column" {...props.gridProps}>
      <Grid item className={classes.columnLabel}>
        {props.title}
      </Grid>
      <Grid item className={classes.accessTableContent}>
        <Table className={classes.accessTable}>
          <TableBody>
            {props.rows.map((thisRow) => {
              return thisRow.text ? (
                <TableRow key={thisRow.text} className={classes.row}>
                  {thisRow.heading ? (
                    <th scope="row">{thisRow.heading}</th>
                  ) : null}
                  <TableCell className={classes.code}>
                    <div className={classes.gradient}>
                      <CopyTooltip text={thisRow.text} copyableText />
                    </div>
                    <CopyTooltip className={classes.copy} text={thisRow.text} />
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
      paddingRight: 0,
    },
    [theme.breakpoints.up(1400)]: {
      flexBasis: '66.67%',
      flexGrow: 0,
      maxWidth: '66.67%',
    },
    [theme.breakpoints.down(1400)]: {
      marginTop: 0,
      marginBottom: 0,
    },
    [theme.breakpoints.down('md')]: {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      '&:first-of-type': {
        paddingBottom: theme.spacing(0.5),
      },
    },
  },
  listItem: {
    display: 'flex',
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    padding: `0px 10px`,
    [theme.breakpoints.down('md')]: {
      flex: '50%',
      borderRight: 'none',
      paddingRight: 0,
    },
  },
  listItemLast: {
    borderRight: 'none',
    paddingRight: 0,
  },
  label: {
    fontFamily: theme.font.bold,
    marginRight: 4,
  },
  tags: {
    [theme.breakpoints.up(1400)]: {
      flexBasis: '33.33%',
      flexGrow: 0,
      maxWidth: '33.33%',
    },
    [theme.breakpoints.down(1400)]: {
      marginLeft: theme.spacing(),
      '& > div': {
        flexDirection: 'row-reverse',
        '& > button': {
          marginRight: 4,
        },
        '& > div': {
          justifyContent: 'flex-start !important',
        },
      },
    },
  },
}));

export const Footer: React.FC<FooterProps> = React.memo((props) => {
  const classes = useFooterStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const {
    linodePlan,
    linodeRegionDisplay,
    linodeId,
    linodeCreated,
    linodeTags,
    openTagDrawer,
  } = props;

  const { updateLinode } = useLinodeActions();
  const { enqueueSnackbar } = useSnackbar();

  const updateTags = React.useCallback(
    (tags: string[]) => {
      return updateLinode({ linodeId, tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [linodeId, updateLinode, enqueueSnackbar]
  );

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
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
              className={classNames({
                [classes.listItem]: true,
                [classes.listItemLast]: matchesSmDown,
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
          tags={linodeTags}
          updateTags={updateTags}
          listAllTags={openTagDrawer}
        />
      </Grid>
    </Grid>
  );
});
