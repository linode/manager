import { Box, rotate360, TooltipIcon, Typography } from '@linode/ui';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { statusTooltipIcons } from 'src/features/Linodes/LinodeEntityDetailHeaderMaintenancePolicy.utils';
import { LinodeMaintenanceText } from 'src/features/Linodes/LinodeMaintenanceText';

import { parseMaintenanceStartTime } from './LinodesLanding/utils';

import type { MaintenancePolicySlug } from '@linode/api-v4';
import type { LinodeMaintenance } from 'src/utilities/linodes';

interface LinodeEntityDetailHeaderMaintenancePolicyProps {
  linodeMaintenancePolicySet: MaintenancePolicySlug | undefined;
  maintenance: LinodeMaintenance | null;
}

export const LinodeEntityDetailHeaderMaintenancePolicy = (
  props: LinodeEntityDetailHeaderMaintenancePolicyProps
) => {
  const { linodeMaintenancePolicySet, maintenance } = props;
  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.start_time || maintenance?.when
  );

  const isPendingOrScheduled =
    maintenance?.status === 'pending' || maintenance?.status === 'scheduled';

  const isInProgress =
    maintenance?.status === 'started' || maintenance?.status === 'in-progress';

  return (
    <Box
      sx={(theme) => ({
        borderLeft: `1px solid ${theme.tokens.alias.Border.Normal}`,
        paddingLeft: theme.spacingFunction(12),
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacingFunction(8),
      })}
    >
      <StyledMaintenanceBox>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          Maintenance Policy:
        </Typography>
      </StyledMaintenanceBox>
      <StyledMaintenanceBox>
        {isInProgress && <StyledAutorenewIcon />}
        <Typography
          sx={(theme) => ({
            color: theme.tokens.alias.Content.Text.Secondary.Default,
          })}
        >
          {linodeMaintenancePolicySet === 'linode/power_off_on'
            ? 'Power Off / Power On'
            : isInProgress
              ? 'Migrating'
              : 'Migrate'}
        </Typography>
        {isInProgress && (
          <TooltipIcon
            className="ui-TooltipIcon ui-TooltipIcon-isActive"
            icon={statusTooltipIcons.active}
            status="other"
            sx={{ tooltip: { maxWidth: 300 }, marginLeft: 0 }}
            sxTooltipIcon={{
              '&&.ui-TooltipIcon': {
                padding: 0,
              },
            }}
            text={
              <LinodeMaintenanceText
                isOpened
                maintenanceStartTime={parsedMaintenanceStartTime}
              />
            }
            tooltipPosition="top"
          />
        )}
      </StyledMaintenanceBox>
      {isPendingOrScheduled && (
        <StyledMaintenanceBox>
          <TooltipIcon
            className="ui-TooltipIcon"
            icon={
              maintenance?.status === 'pending'
                ? statusTooltipIcons.pending
                : statusTooltipIcons.scheduled
            }
            status="other"
            sx={{ tooltip: { maxWidth: 300 }, marginLeft: 0 }}
            sxTooltipIcon={{
              '&&.ui-TooltipIcon': {
                padding: 0,
              },
            }}
            text={
              maintenance?.status === 'pending' ? (
                "This Linode's maintenance window is pending."
              ) : (
                <LinodeMaintenanceText
                  isOpened={false}
                  maintenanceStartTime={parsedMaintenanceStartTime}
                />
              )
            }
            tooltipPosition="top"
          />
        </StyledMaintenanceBox>
      )}
    </Box>
  );
};

const StyledAutorenewIcon = styled(AutorenewIcon)(({ theme }) => ({
  animation: `${rotate360} 2s linear infinite`,
  height: '20px',
  width: '20px',
  fill: theme.tokens.alias.Content.Icon.Informative,
}));

const StyledMaintenanceBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacingFunction(8),
}));
