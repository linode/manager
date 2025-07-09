import { Box, Button, TooltipIcon } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';

import { VPC_REBOOT_MESSAGE } from '../VPCs/constants';
import { StyledLink } from './LinodeEntityDetail.styles';
import { LinodeEntityDetailHeaderMaintenancePolicy } from './LinodeEntityDetailHeaderMaintenancePolicy';
import { LinodeStatus } from './LinodesLanding/LinodeRow/LinodeStatus';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  Config,
  LinodeBackups,
  MaintenancePolicySlug,
} from '@linode/api-v4';
import type { Linode, LinodeType } from '@linode/api-v4/lib/linodes/types';
import type { TypographyProps } from '@linode/ui';
import type { LinodeMaintenance } from 'src/utilities/linodes';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export interface Props extends LinodeEntityDetailProps {
  handlers: LinodeHandlers;
}

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  backups: LinodeBackups;
  configs?: Config[];
  image: string;
  imageVendor: null | string;
  isSummaryView?: boolean;
  linodeId: number;
  linodeLabel: string;
  linodeMaintenancePolicySet: MaintenancePolicySlug | undefined;
  linodeRegionDisplay: string;
  linodeStatus: Linode['status'];
  maintenance: LinodeMaintenance | null;
  openNotificationMenu: () => void;
  progress?: number;
  transitionText?: string;
  type: LinodeType | null;
  variant?: TypographyProps['variant'];
}

interface LinodeEntityDetailHeaderProps extends HeaderProps {
  handlers: LinodeHandlers;
}

export const LinodeEntityDetailHeader = (
  props: LinodeEntityDetailHeaderProps
) => {
  const theme = useTheme();

  const {
    backups,
    configs,
    handlers,
    isSummaryView,
    linodeId,
    linodeLabel,
    linodeRegionDisplay,
    linodeStatus,
    linodeMaintenancePolicySet,
    maintenance,
    openNotificationMenu,
    progress,
    transitionText,
    type,
    variant,
  } = props;

  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const isRunning = linodeStatus === 'running';

  const isRebootNeeded = React.useMemo(
    () =>
      isRunning &&
      configs?.some((config) =>
        config.interfaces?.some(
          (linodeInterface) =>
            linodeInterface.purpose === 'vpc' && !linodeInterface.active
        )
      ),
    [configs, isRunning]
  );

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
      <Box
        sx={(theme) => ({
          ...sxBoxFlex,
          gap: theme.spacingFunction(8),
          flexWrap: 'wrap',
          padding: `${theme.spacingFunction(6)} 0 ${theme.spacingFunction(6)} ${theme.spacingFunction(16)}`,
        })}
      >
        <LinodeStatus linodeId={linodeId} linodeStatus={linodeStatus} />
        {isRebootNeeded && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              padding: `0 ${theme.spacingFunction(4)} 0 0`,
            }}
            text={VPC_REBOOT_MESSAGE}
          />
        )}
        {isVMHostMaintenanceEnabled && (
          <LinodeEntityDetailHeaderMaintenancePolicy
            linodeMaintenancePolicySet={linodeMaintenancePolicySet}
            maintenance={maintenance}
          />
        )}
        {hasSecondaryStatus && (
          <Button
            buttonType="secondary"
            onClick={openNotificationMenu}
            sx={{ minWidth: '64px' }}
          >
            <ProgressDisplay
              progress={progress ?? 0}
              sx={{ color: 'primary.main', font: theme.font.bold }}
              text={formattedTransitionText}
            />
          </Button>
        )}
      </Box>
      <Box sx={sxBoxFlex}>
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
