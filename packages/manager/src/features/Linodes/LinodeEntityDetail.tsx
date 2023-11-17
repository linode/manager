import { Config, VPC } from '@linode/api-v4/lib';
import { LinodeBackups } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { HashLink } from 'react-router-hash-link';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import EntityDetail from 'src/components/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { TagCell } from 'src/components/TagCell/TagCell';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography, TypographyProps } from 'src/components/Typography';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useVPCConfigInterface } from 'src/hooks/useVPCConfigInterface';
import { useAllImagesQuery } from 'src/queries/images';
import {
  queryKey as linodesQueryKey,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
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

import { VPC_REBOOT_MESSAGE } from '../VPCs/constants';
import {
  StyledBodyGrid,
  StyledBox,
  StyledChip,
  StyledColumnLabelGrid,
  StyledLabelBox,
  StyledLink,
  StyledListItem,
  StyledRightColumnGrid,
  StyledSummaryGrid,
  StyledVPCBox,
  sxLastListItem,
  sxListItemFirstChild,
} from './LinodeEntityDetail.styles';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import {
  transitionText as _transitionText,
  getProgressOrDefault,
  isEventWithSecondaryLinodeStatus,
} from './transitions';

import type {
  Interface,
  Linode,
  LinodeType,
} from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs';

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

export const LinodeEntityDetail = (props: Props) => {
  const { handlers, isSummaryView, linode, openTagDrawer, variant } = props;

  const notificationContext = React.useContext(_notificationContext);

  const recentEvent = useRecentEventForLinode(linode.id);

  const { data: images } = useAllImagesQuery({}, {});

  const { data: type } = useTypeQuery(linode.type ?? '', Boolean(linode.type));

  const { data: volumes } = useLinodeVolumesQuery(linode.id);

  const numberOfVolumes = volumes?.results ?? 0;

  const { data: regions } = useRegionsQuery();

  const {
    configInterfaceWithVPC,
    configs,
    enableVPCLogic,
    isVPCOnlyLinode,
    vpcLinodeIsAssignedTo,
  } = useVPCConfigInterface(linode.id);

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
          configInterfaceWithVPC={configInterfaceWithVPC}
          displayVPCSection={enableVPCLogic}
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          ipv4={linode.ipv4}
          ipv6={trimmedIPv6}
          isVPCOnlyLinode={isVPCOnlyLinode}
          linodeId={linode.id}
          linodeLabel={linode.label}
          numCPUs={linode.specs.vcpus}
          numVolumes={numberOfVolumes}
          region={linode.region}
          vpcLinodeIsAssignedTo={vpcLinodeIsAssignedTo}
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
          configs={configs}
          enableVPCLogic={enableVPCLogic}
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

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  backups: LinodeBackups;
  configs?: Config[];
  enableVPCLogic?: boolean;
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

const Header = (props: HeaderProps & { handlers: LinodeHandlers }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    backups,
    configs,
    enableVPCLogic,
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

  const isRebootNeeded =
    enableVPCLogic &&
    isRunning &&
    configs?.some((config) =>
      config.interfaces.some(
        (linodeInterface) =>
          linodeInterface.purpose === 'vpc' && !linodeInterface.active
      )
    );

  // If the Linode is running, we want to check the active status of its interfaces to determine whether it needs to
  // be rebooted or not. So, we need to invalidate the linode configs query to get the most up to date information.
  React.useEffect(() => {
    if (isRunning && enableVPCLogic) {
      queryClient.invalidateQueries([
        linodesQueryKey,
        'linode',
        linodeId,
        'configs',
      ]);
    }
  }, [linodeId, enableVPCLogic, isRunning, queryClient]);

  const formattedStatus = isRebootNeeded
    ? 'REBOOT NEEDED'
    : linodeStatus.replace('_', ' ').toUpperCase();
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
      isSummaryView={isSummaryView}
      title={<StyledLink to={`linodes/${linodeId}`}>{linodeLabel}</StyledLink>}
      variant={variant}
    >
      <Box sx={sxBoxFlex}>
        <StyledChip
          aria-label={`Linode status ${linodeStatus}`}
          component="span"
          data-qa-linode-status
          hasSecondaryStatus={hasSecondaryStatus}
          isOffline={isOffline}
          isOther={isOther}
          isRunning={isRunning}
          isSummaryView={isSummaryView}
          label={formattedStatus}
          pill={true}
        />
        {isRebootNeeded && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ padding: 0 }}
            text={VPC_REBOOT_MESSAGE}
          />
        )}
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
  configInterfaceWithVPC?: Interface;
  displayVPCSection: boolean;
  gbRAM: number;
  gbStorage: number;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  isVPCOnlyLinode: boolean;
  linodeId: number;
  linodeLabel: string;
  numCPUs: number;
  numVolumes: number;
  region: string;
  vpcLinodeIsAssignedTo?: VPC;
}

export const Body = React.memo((props: BodyProps) => {
  const {
    configInterfaceWithVPC,
    displayVPCSection,
    gbRAM,
    gbStorage,
    ipv4,
    ipv6,
    isVPCOnlyLinode,
    linodeId,
    linodeLabel,
    numCPUs,
    numVolumes,
    region,
    vpcLinodeIsAssignedTo,
  } = props;

  const { data: profile } = useProfile();
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  // Filter and retrieve subnets associated with a specific Linode ID
  const linodeAssociatedSubnets = vpcLinodeIsAssignedTo?.subnets.filter(
    (subnet) => subnet.linodes.some((linode) => linode.id === linodeId)
  );

  const numIPAddresses = ipv4.length + (ipv6 ? 1 : 0);

  const firstAddress = ipv4[0];

  // If IPv6 is enabled, always use it in the second address slot. Otherwise use
  // the second IPv4 address if it exists.
  const secondAddress = ipv6 ? ipv6 : ipv4.length > 1 ? ipv4[1] : null;

  return (
    <>
      <StyledBodyGrid container direction="row" spacing={2}>
        {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
        <Grid
          sx={{
            flexBasis: '25%',
          }}
          container
          direction="column"
          spacing={2}
        >
          <StyledColumnLabelGrid>Summary</StyledColumnLabelGrid>
          <StyledSummaryGrid container direction="row" spacing={2}>
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
          </StyledSummaryGrid>
        </Grid>
        <StyledRightColumnGrid
          container
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <AccessTable
            footer={
              numIPAddresses > 2 ? (
                <Typography variant="body1">
                  <HashLink
                    to={`/linodes/${linodeId}/networking#${ipv4TableID}`}
                  >
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
            isVPCOnlyLinode={isVPCOnlyLinode}
            rows={[{ text: firstAddress }, { text: secondAddress }]}
            title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
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
            isVPCOnlyLinode={isVPCOnlyLinode}
            title="Access"
          />
        </StyledRightColumnGrid>
      </StyledBodyGrid>
      {displayVPCSection && vpcLinodeIsAssignedTo && (
        <Grid
          sx={{
            borderTop: `1px solid ${theme.borderColors.borderTable}`,
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          }}
          container
          direction="column"
          spacing={2}
        >
          <StyledColumnLabelGrid data-testid="vpc-section-title">
            VPC
          </StyledColumnLabelGrid>
          <Grid
            sx={{
              margin: 0,
              padding: '0 0 8px 0',
              [theme.breakpoints.down('md')]: {
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: '8px',
              },
            }}
            container
            direction="row"
            spacing={2}
          >
            <StyledVPCBox>
              <StyledListItem>
                <StyledLabelBox component="span">Label:</StyledLabelBox>{' '}
                <Link
                  data-testid="assigned-vpc-label"
                  to={`/vpcs/${vpcLinodeIsAssignedTo.id}`}
                >
                  {vpcLinodeIsAssignedTo.label}
                </Link>
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem>
                <StyledLabelBox component="span" data-testid="subnets-string">
                  Subnets:
                </StyledLabelBox>{' '}
                {getSubnetsString(linodeAssociatedSubnets ?? [])}
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem sx={{ ...sxLastListItem }}>
                <StyledLabelBox component="span" data-testid="vpc-ipv4">
                  VPC IPv4:
                </StyledLabelBox>{' '}
                {configInterfaceWithVPC?.ipv4?.vpc}
              </StyledListItem>
            </StyledVPCBox>
          </Grid>
        </Grid>
      )}
    </>
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
        <StyledBox>
          {linodePlan && (
            <StyledListItem
              sx={{
                ...sxListItemFirstChild,
                [theme.breakpoints.down('lg')]: {
                  paddingLeft: 0,
                },
              }}
            >
              <StyledLabelBox component="span">Plan: </StyledLabelBox>{' '}
              {linodePlan}
            </StyledListItem>
          )}
          {linodeRegionDisplay && (
            <StyledListItem>
              <StyledLabelBox component="span">Region:</StyledLabelBox>{' '}
              {linodeRegionDisplay}
            </StyledListItem>
          )}
        </StyledBox>
        <StyledBox>
          <StyledListItem sx={{ ...sxListItemFirstChild }}>
            <StyledLabelBox component="span">Linode ID:</StyledLabelBox>{' '}
            {linodeId}
          </StyledListItem>
          <StyledListItem
            sx={{
              ...sxLastListItem,
            }}
          >
            <StyledLabelBox component="span">Created:</StyledLabelBox>{' '}
            {formatDate(linodeCreated, {
              timezone: profile?.timezone,
            })}
          </StyledListItem>
        </StyledBox>
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

export const getSubnetsString = (data: Subnet[]) => {
  const firstThreeSubnets = data.slice(0, 3);
  const subnetLabels = firstThreeSubnets.map((subnet) => subnet.label);
  const firstThreeSubnetsString = subnetLabels.join(', ');

  return data.length > 3
    ? firstThreeSubnetsString.concat(`, plus ${data.length - 3} more.`)
    : firstThreeSubnetsString;
};
