import { LinodeBackups } from '@linode/api-v4/lib/linodes';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes/types';
import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { Theme, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { SxProps } from '@mui/system';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import Button from 'src/components/Button';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import EntityDetail from 'src/components/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { TableBody } from 'src/components/TableBody';
import { TableRow } from 'src/components/TableRow';
import { TagCell } from 'src/components/TagCell/TagCell';
import Box from 'src/components/core/Box';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import LinodeActionMenu from 'src/features/Linodes/LinodesLanding/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { useAllImagesQuery } from 'src/queries/images';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/analytics';
import { pluralize } from 'src/utilities/pluralize';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeNetworking';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';
// This component was built asuming an unmodified MUI <Table />
import Table from '@mui/material/Table';
import { TableCell } from 'src/components/TableCell';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

interface LinodeEntityDetailProps {
  variant?: TypographyProps['variant'];
  id: number;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  isSummaryView?: boolean;
}

export type Props = LinodeEntityDetailProps & {
  handlers: LinodeHandlers;
};

const LinodeEntityDetail = (props: Props) => {
  const { variant, linode, isSummaryView, openTagDrawer, handlers } = props;

  const notificationContext = React.useContext(_notificationContext);

  const recentEvent = useRecentEventForLinode(linode.id);

  const { data: images } = useAllImagesQuery({}, {});

  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));

  const { data: volumes } = useLinodeVolumesQuery(linode.id);

  const numberOfVolumes = volumes?.results ?? 0;

  const { data: regions } = useRegionsQuery();

  const imageVendor =
    images?.find((i) => i.id === linode.image)?.vendor ?? null;

  const linodePlan = type ? formatStorageUnits(type.label) : linode.type;

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
          linodeRegionDisplay={linodeRegionDisplay}
          backups={linode.backups}
          isSummaryView={isSummaryView}
          type={type ?? null}
          image={linode.image ?? 'Unknown Image'}
          openNotificationMenu={notificationContext.openMenu}
          progress={progress}
          transitionText={transitionText}
          handlers={handlers}
        />
      }
      body={
        <Body
          linodeLabel={linode.label}
          numVolumes={numberOfVolumes}
          numCPUs={linode.specs.vcpus}
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          region={linode.region}
          ipv4={linode.ipv4}
          ipv6={trimmedIPv6}
          linodeId={linode.id}
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
        />
      }
    />
  );
};

export default LinodeEntityDetail;

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  variant?: TypographyProps['variant'];
  imageVendor: string | null;
  linodeLabel: string;
  linodeId: number;
  linodeStatus: Linode['status'];
  linodeRegionDisplay: string;
  backups: LinodeBackups;
  type: LinodeType | null;
  image: string;
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

const Header = (props: HeaderProps & { handlers: LinodeHandlers }) => {
  const classes = useHeaderStyles();
  const theme = useTheme();

  const {
    linodeLabel,
    linodeId,
    linodeStatus,
    linodeRegionDisplay,
    backups,
    type,
    variant,
    isSummaryView,
    progress,
    transitionText,
    openNotificationMenu,
    handlers,
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
              handlers.onOpenPowerDialog(isRunning ? 'Power Off' : 'Power On')
            }
          >
            {isRunning ? 'Power Off' : 'Power On'}
          </Button>
          <Button
            buttonType="secondary"
            sx={sxActionItem}
            disabled={isOffline}
            onClick={() => handlers.onOpenPowerDialog('Reboot')}
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
          {...handlers}
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

export const Body = React.memo((props: BodyProps) => {
  const classes = useBodyStyles();
  const {
    numCPUs,
    gbRAM,
    gbStorage,
    region,
    ipv4,
    ipv6,
    linodeLabel,
    linodeId,
    numVolumes,
  } = props;

  const { data: profile } = useProfile();

  const username = profile?.username ?? 'none';

  const theme = useTheme();
  const numIPAddresses = ipv4.length + (ipv6 ? 1 : 0);

  const firstAddress = ipv4[0];

  // If IPv6 is enabled, always use it in the second address slot. Otherwise use
  // the second IPv4 address if it exists.
  const secondAddress = ipv6 ? ipv6 : ipv4.length > 1 ? ipv4[1] : null;

  return (
    <Grid container className={classes.body} direction="row" spacing={2}>
      {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
      <Grid
        container
        className={classes.summaryContainer}
        direction="column"
        spacing={2}
      >
        <Grid className={classes.columnLabel}>Summary</Grid>
        <Grid
          container
          className={classes.summaryContent}
          direction="row"
          spacing={2}
        >
          <Grid>
            <Typography>
              {pluralize('CPU Core', 'CPU Cores', numCPUs)}
            </Typography>
          </Grid>
          <Grid>
            <Typography>{gbStorage} GB Storage</Typography>
          </Grid>
          <Grid>
            <Typography>{gbRAM} GB RAM</Typography>
          </Grid>
          <Grid>
            <Typography>
              {pluralize('Volume', 'Volumes', numVolumes)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        className={classes.rightColumn}
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          paddingRight: 0,
          paddingBottom: 0,
        }}
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
          sx={{
            [theme.breakpoints.up('md')]: {
              paddingRight: theme.spacing(2.5),
            },
          }}
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
          sx={{
            [theme.breakpoints.up('md')]: {
              paddingLeft: theme.spacing(2.5),
            },
          }}
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
  gridProps?: Grid2Props;
  footer?: JSX.Element;
  sx?: SxProps;
}

export const AccessTable: React.FC<AccessTableProps> = React.memo((props) => {
  const classes = useAccessTableStyles();
  return (
    <Grid
      container
      md={6}
      direction="column"
      spacing={1}
      sx={props.sx}
      {...props.gridProps}
    >
      <Grid className={classes.columnLabel}>{props.title}</Grid>
      <Grid className={classes.accessTableContent}>
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
        {props.footer ? <Grid sx={{ padding: 0 }}>{props.footer}</Grid> : null}
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
}

export const Footer = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();

  const {
    linodePlan,
    linodeRegionDisplay,
    linodeId,
    linodeCreated,
    linodeTags,
    openTagDrawer,
  } = props;

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(linodeId);

  const { enqueueSnackbar } = useSnackbar();

  const updateTags = React.useCallback(
    (tags: string[]) => {
      return updateLinode({ tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateLinode, enqueueSnackbar]
  );

  const sxListItemMdBp = {
    flex: '50%',
    borderRight: 0,
    padding: 0,
  };

  const sxListItem = {
    display: 'flex',
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    padding: `0px 10px`,
    [theme.breakpoints.down('md')]: {
      ...sxListItemMdBp,
    },
  };

  const sxListItemFirstChild = {
    [theme.breakpoints.down('md')]: {
      ...sxListItemMdBp,
      '&:first-of-type': {
        paddingBottom: theme.spacing(0.5),
      },
    },
  };

  const sxLastListItem = {
    borderRight: 0,
    paddingRight: 0,
  };

  const sxBox = {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  };

  const sxLabel = {
    fontFamily: theme.font.bold,
    marginRight: '4px',
  };

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        padding: 0,
        flex: 1,
      }}
    >
      <Grid
        alignItems="flex-start"
        xs={12}
        lg={8}
        sx={{
          display: 'flex',
          padding: 0,
          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
          [theme.breakpoints.down('lg')]: {
            padding: '8px',
          },
        }}
      >
        <Box sx={sxBox}>
          {linodePlan && (
            <Typography
              sx={{
                ...sxListItem,
                ...sxListItemFirstChild,
                [theme.breakpoints.down('lg')]: {
                  paddingLeft: 0,
                },
              }}
            >
              <Box sx={sxLabel}>Plan: </Box> {linodePlan}
            </Typography>
          )}
          {linodeRegionDisplay && (
            <Typography
              sx={{
                ...sxListItem,
              }}
            >
              <Box sx={sxLabel}>Region:</Box> {linodeRegionDisplay}
            </Typography>
          )}
        </Box>
        <Box sx={sxBox}>
          <Typography sx={{ ...sxListItem, ...sxListItemFirstChild }}>
            <Box sx={sxLabel}>Linode ID:</Box> {linodeId}
          </Typography>
          <Typography
            sx={{
              ...sxListItem,
              ...sxLastListItem,
            }}
          >
            <Box sx={sxLabel}>Created:</Box>{' '}
            {formatDate(linodeCreated, {
              timezone: profile?.timezone,
            })}
          </Typography>
        </Box>
      </Grid>
      <Grid
        xs={12}
        lg={4}
        sx={{
          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
      >
        <TagCell
          tags={linodeTags}
          updateTags={updateTags}
          listAllTags={openTagDrawer}
          sx={{
            [theme.breakpoints.down('lg')]: {
              flexDirection: 'row-reverse',
              '& > button': {
                marginRight: theme.spacing(0.5),
              },
            },
          }}
        />
      </Grid>
    </Grid>
  );
});
