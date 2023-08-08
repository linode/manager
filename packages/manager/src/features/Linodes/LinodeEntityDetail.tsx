import { LinodeBackups } from '@linode/api-v4/lib/linodes';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes/types';
// This component was built asuming an unmodified MUI <Table />
import Table from '@mui/material/Table';
import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { Theme, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { SxProps } from '@mui/system';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import EntityDetail from 'src/components/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Hidden } from 'src/components/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TagCell } from 'src/components/TagCell/TagCell';
import { Typography, TypographyProps } from 'src/components/Typography';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useAllImagesQuery } from 'src/queries/images';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/analytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { pluralize } from 'src/utilities/pluralize';

import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeNetworking';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export type Props = LinodeEntityDetailProps & {
  handlers: LinodeHandlers;
};

const LinodeEntityDetail = (props: Props) => {
  const { handlers, isSummaryView, linode, openTagDrawer, variant } = props;

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
      body={
        <Body
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          ipv4={linode.ipv4}
          ipv6={trimmedIPv6}
          linodeId={linode.id}
          linodeLabel={linode.label}
          numCPUs={linode.specs.vcpus}
          numVolumes={numberOfVolumes}
          region={linode.region}
        />
      }
      footer={
        <Footer
          linodeCreated={linode.created}
          linodeId={linode.id}
          linodeLabel={linode.label}
          linodePlan={linodePlan}
          linodeRegionDisplay={linodeRegionDisplay}
          linodeTags={linode.tags}
          openTagDrawer={openTagDrawer}
        />
      }
      header={
        <Header
          backups={linode.backups}
          handlers={handlers}
          image={linode.image ?? 'Unknown Image'}
          imageVendor={imageVendor}
          isSummaryView={isSummaryView}
          linodeId={linode.id}
          linodeLabel={linode.label}
          linodeRegionDisplay={linodeRegionDisplay}
          linodeStatus={linode.status}
          openNotificationMenu={notificationContext.openMenu}
          progress={progress}
          transitionText={transitionText}
          type={type ?? null}
          variant={variant}
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
  backups: LinodeBackups;
  image: string;
  imageVendor: null | string;
  isSummaryView?: boolean;
  linodeId: number;
  linodeLabel: string;
  linodeRegionDisplay: string;
  linodeStatus: Linode['status'];
  openNotificationMenu: () => void;
  progress?: number;
  transitionText?: string;
  type: LinodeType | null;
  variant?: TypographyProps['variant'];
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  actionItemsOuter: {
    '&.MuiGrid-item': {
      paddingRight: 0,
    },
    alignItems: 'center',
    display: 'flex',
  },
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
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
  divider: {
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    paddingRight: `16px !important`,
  },
  linodeLabel: {
    '&:hover': {
      color: theme.palette.primary.light,
      textDecoration: 'underline',
    },
    marginLeft: theme.spacing(),
  },
  root: {
    backgroundColor: theme.bg.bgPaper,
  },
  statusChip: {
    ...theme.applyStatusPillStyles,
    borderRadius: 0,
    fontSize: '0.875rem',
    height: `24px !important`,
    letterSpacing: '.5px',
    marginLeft: theme.spacing(2),
  },
  statusChipLandingDetailView: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
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
  statusRunning: {
    '&:before': {
      backgroundColor: theme.color.teal,
    },
  },
}));

const Header = (props: HeaderProps & { handlers: LinodeHandlers }) => {
  const classes = useHeaderStyles();
  const theme = useTheme();

  const {
    backups,
    handlers,
    isSummaryView,
    linodeId,
    linodeLabel,
    linodeRegionDisplay,
    linodeStatus,
    openNotificationMenu,
    progress,
    transitionText,
    type,
    variant,
  } = props;

  const isRunning = linodeStatus === 'running';
  const isOffline = linodeStatus === 'stopped' || linodeStatus === 'offline';
  const isOther = !['offline', 'running', 'stopped'].includes(linodeStatus);

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
    '&:hover': {
      backgroundColor: theme.color.blueDTwhite,
      color: theme.color.white,
    },
    color: theme.textColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '0.875rem',
    height: theme.spacing(5),
    minWidth: 'auto',
  };

  const sxBoxFlex = {
    alignItems: 'center',
    display: 'flex',
  };

  return (
    <EntityHeader
      title={
        <Link className={classes.linodeLabel} to={`linodes/${linodeId}`}>
          {linodeLabel}
        </Link>
      }
      isSummaryView={isSummaryView}
      variant={variant}
    >
      <Box sx={sxBoxFlex}>
        <Chip
          className={classNames({
            [classes.divider]: hasSecondaryStatus,
            [classes.statusChip]: true,
            [classes.statusChipLandingDetailView]: isSummaryView,
            [classes.statusOffline]: isOffline,
            [classes.statusOther]: isOther,
            [classes.statusRunning]: isRunning,
            statusOtherDetail: isOther,
          })}
          component="span"
          data-qa-linode-status
          label={formattedStatus}
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
            onClick={() =>
              handlers.onOpenPowerDialog(isRunning ? 'Power Off' : 'Power On')
            }
            buttonType="secondary"
            disabled={!(isRunning || isOffline)}
            sx={sxActionItem}
          >
            {isRunning ? 'Power Off' : 'Power On'}
          </Button>
          <Button
            buttonType="secondary"
            disabled={isOffline}
            onClick={() => handlers.onOpenPowerDialog('Reboot')}
            sx={sxActionItem}
          >
            Reboot
          </Button>
          <Button
            onClick={() => {
              handleConsoleButtonClick(linodeId);
            }}
            buttonType="secondary"
            sx={sxActionItem}
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
  gbRAM: number;
  gbStorage: number;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  linodeId: number;
  linodeLabel: string;
  numCPUs: number;
  numVolumes: number;
  region: string;
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
  rightColumn: {
    flexBasis: '75%',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
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
}));

export const Body = React.memo((props: BodyProps) => {
  const classes = useBodyStyles();
  const {
    gbRAM,
    gbStorage,
    ipv4,
    ipv6,
    linodeId,
    linodeLabel,
    numCPUs,
    numVolumes,
    region,
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
    <Grid className={classes.body} container direction="row" spacing={2}>
      {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
      <Grid
        className={classes.summaryContainer}
        container
        direction="column"
        spacing={2}
      >
        <Grid className={classes.columnLabel}>Summary</Grid>
        <Grid
          className={classes.summaryContent}
          container
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
        sx={{
          paddingBottom: 0,
          paddingRight: 0,
        }}
        className={classes.rightColumn}
        container
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <AccessTable
          footer={
            numIPAddresses > 2 ? (
              <Typography variant="body1">
                <HashLink to={`/linodes/${linodeId}/networking#${ipv4TableID}`}>
                  View all IP Addresses
                </HashLink>
              </Typography>
            ) : undefined
          }
          sx={{
            [theme.breakpoints.up('md')]: {
              paddingRight: theme.spacing(2.5),
            },
          }}
          gridProps={{ md: 5 }}
          rows={[{ text: firstAddress }, { text: secondAddress }]}
          title={`IP Address${numIPAddresses > 1 ? 'es' : ''}`}
        />

        <AccessTable
          rows={[
            { heading: 'SSH Access', text: sshLink(ipv4[0]) },
            {
              heading: 'LISH Console via SSH',
              text: lishLink(username, region, linodeLabel),
            },
          ]}
          sx={{
            [theme.breakpoints.up('md')]: {
              paddingLeft: theme.spacing(2.5),
            },
          }}
          gridProps={{ md: 7 }}
          title="Access"
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
  accessTable: {
    '& td': {
      border: 'none',
      borderBottom: `1px solid ${theme.bg.bgPaper}`,
      fontSize: '0.875rem',
      lineHeight: 1,
      whiteSpace: 'nowrap',
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
    '& tr': {
      height: 32,
    },
    tableLayout: 'fixed',
  },
  accessTableContent: {
    '&.MuiGrid-item': {
      padding: 0,
      paddingLeft: theme.spacing(),
    },
  },
  code: {
    '& div': {
      fontSize: 15,
    },
    alignItems: 'center',
    backgroundColor: theme.bg.bgAccessRow,
    color: theme.textColors.tableStatic,
    display: 'flex',
    fontFamily: '"UbuntuMono", monospace, sans-serif',
    justifyContent: 'space-between',
    padding: '4px 8px',
    position: 'relative',
  },
  columnLabel: {
    color: theme.textColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  copy: {
    '& svg': {
      height: `12px`,
      opacity: 0,
      width: `12px`,
    },
  },
  copyCell: {
    '& svg': {
      '& path': {
        fill: theme.textColors.linkActiveLight,
      },
      height: 16,
      width: 16,
    },
    '&:hover': {
      '& svg path': {
        fill: '#fff',
      },
      backgroundColor: '#3683dc',
    },
    backgroundColor: theme.bg.lightBlue2,
    height: 33,
    padding: 0,
    width: 36,
  },
  gradient: {
    '&:after': {
      backgroundImage: `linear-gradient(to right,  ${theme.bg.bgAccessRowTransparentGradient}, ${theme.bg.bgAccessRow});`,
      bottom: 0,
      content: '""',
      height: '100%',
      position: 'absolute',
      right: 0,
      width: 30,
    },
    overflowX: 'auto',
    overflowY: 'hidden', // For Edge
    paddingRight: 15,
  },
  row: {
    '&:hover $copy > svg, & $copy:focus > svg': {
      opacity: 1,
    },
  },
}));

interface AccessTableRow {
  heading?: string;
  text: null | string;
}

interface AccessTableProps {
  footer?: JSX.Element;
  gridProps?: Grid2Props;
  rows: AccessTableRow[];
  sx?: SxProps;
  title: string;
}

export const AccessTable: React.FC<AccessTableProps> = React.memo((props) => {
  const classes = useAccessTableStyles();
  return (
    <Grid
      container
      direction="column"
      md={6}
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
                <TableRow className={classes.row} key={thisRow.text}>
                  {thisRow.heading ? (
                    <th scope="row">{thisRow.heading}</th>
                  ) : null}
                  <TableCell className={classes.code}>
                    <div className={classes.gradient}>
                      <CopyTooltip copyableText text={thisRow.text} />
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
  linodeCreated: string;
  linodeId: number;
  linodeLabel: string;
  linodePlan: null | string;
  linodeRegionDisplay: null | string;
  linodeTags: string[];
  openTagDrawer: (tags: string[]) => void;
}

export const Footer = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();

  const {
    linodeCreated,
    linodeId,
    linodePlan,
    linodeRegionDisplay,
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
    borderRight: 0,
    flex: '50%',
    padding: 0,
  };

  const sxListItem = {
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    display: 'flex',
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
    alignItems: 'center',
    display: 'flex',
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
      sx={{
        flex: 1,
        padding: 0,
      }}
      alignItems="center"
      container
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Grid
        sx={{
          display: 'flex',
          padding: 0,
          [theme.breakpoints.down('lg')]: {
            padding: '8px',
          },
          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
        }}
        alignItems="flex-start"
        lg={8}
        xs={12}
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
              <Box component="span" sx={sxLabel}>
                Plan:{' '}
              </Box>{' '}
              {linodePlan}
            </Typography>
          )}
          {linodeRegionDisplay && (
            <Typography
              sx={{
                ...sxListItem,
              }}
            >
              <Box component="span" sx={sxLabel}>
                Region:
              </Box>{' '}
              {linodeRegionDisplay}
            </Typography>
          )}
        </Box>
        <Box sx={sxBox}>
          <Typography sx={{ ...sxListItem, ...sxListItemFirstChild }}>
            <Box component="span" sx={sxLabel}>
              Linode ID:
            </Box>{' '}
            {linodeId}
          </Typography>
          <Typography
            sx={{
              ...sxListItem,
              ...sxLastListItem,
            }}
          >
            <Box component="span" sx={sxLabel}>
              Created:
            </Box>{' '}
            {formatDate(linodeCreated, {
              timezone: profile?.timezone,
            })}
          </Typography>
        </Box>
      </Grid>
      <Grid
        sx={{
          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
        lg={4}
        xs={12}
      >
        <TagCell
          sx={{
            [theme.breakpoints.down('lg')]: {
              '& > button': {
                marginRight: theme.spacing(0.5),
              },
              flexDirection: 'row-reverse',
            },
          }}
          listAllTags={openTagDrawer}
          tags={linodeTags}
          updateTags={updateTags}
        />
      </Grid>
    </Grid>
  );
});
