import { useIsGeckoEnabled } from '@linode/shared';
import { Box, Dialog, Divider, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import { NETWORK_TRANSFER_USAGE_AND_COST_LINK } from './constants';
import { TransferDisplayDialogHeader } from './TransferDisplayDialogHeader';
import { TransferDisplayUsage } from './TransferDisplayUsage';
import { formatRegionList, getDaysRemaining } from './utils';

import type { RegionTransferPool } from './utils';

export interface TransferDisplayDialogProps {
  generalPoolUsage: PoolUsage;
  generalPoolUsagePct: number;
  isOpen: boolean;
  onClose: () => void;
  regionTransferPools: RegionTransferPool[];
}

type PoolUsage = {
  quota: number;
  used: number;
};

export const TransferDisplayDialog = React.memo(
  (props: TransferDisplayDialogProps) => {
    const {
      generalPoolUsage: { quota, used },
      generalPoolUsagePct,
      isOpen,
      onClose,
      regionTransferPools,
    } = props;
    const theme = useTheme();
    const flags = useFlags();
    const { isGeckoLAEnabled } = useIsGeckoEnabled(
      flags.gecko2?.enabled,
      flags.gecko2?.la
    );

    const daysRemainingInMonth = getDaysRemaining();
    const listOfOtherRegionTransferPools: string[] =
      regionTransferPools.length > 0
        ? regionTransferPools.map((pool) => pool.regionName)
        : [];
    const otherRegionPools = formatRegionList(listOfOtherRegionTransferPools);

    const transferQuotaDocsText =
      used === 0
        ? 'Compute instances, NodeBalancers, and Object Storage include network transfer.'
        : 'In some regions, the monthly network transfer is calculated and tracked independently. Transfer overages will be billed separately.';

    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={onClose}
        open={isOpen}
        title="Monthly Network Transfer Pool"
      >
        {/**
         *  Global Transfer Pool Display
         */}
        <TransferDisplayDialogHeader
          dataTestId="global-transfer-pool-header"
          headerText="Global Network Transfer Pool"
          tooltipText={`The Global Pool includes transfer associated with active services in your devices' ${
            isGeckoLAEnabled ? 'core' : ''
          } regions${
            listOfOtherRegionTransferPools.length > 0
              ? ` except for ${otherRegionPools}.`
              : '.'
          }
          `}
        />
        <Typography marginBottom={theme.spacing(2)}>
          Any additional transfer usage that exceeds this monthly allotment
          starts at $0.005/GB (or $5/TB) depending on the service’s region.
          Additional transfer usage is charged at the end of the billing period.
          For more information, refer to{' '}
          <Link to={NETWORK_TRANSFER_USAGE_AND_COST_LINK}>
            Network Transfer Usage and Costs
          </Link>
          .
        </Typography>
        <TransferDisplayUsage
          pullUsagePct={generalPoolUsagePct}
          quota={quota}
          used={used}
        />
        <StyledDivider />
        {/**
         *  DC-specific Transfer Pool Display
         */}
        {regionTransferPools.length > 0 && (
          <>
            <TransferDisplayDialogHeader
              dataTestId="other-transfer-pools-header"
              headerText="Other Transfer Pools"
              tooltipText="In some regions, the monthly network transfer is calculated and tracked independently. Transfer overages will be billed separately."
            />
            <Typography marginBottom={theme.spacing(2)} marginTop={-1}>
              These data center-specific transfer pools are not included in the
              Global Transfer Pool.
            </Typography>

            {regionTransferPools.map((pool, key) => (
              <Box
                key={`transfer-pool-region-${key}`}
                marginTop={theme.spacing(2)}
              >
                <Typography
                  fontSize={theme.typography.h3.fontSize}
                  marginBottom={theme.spacing()}
                  sx={{ font: theme.font.bold }}
                >
                  {pool.regionName}{' '}
                  <Typography
                    component="span"
                    fontSize={theme.typography.h3.fontSize}
                  >
                    ({pool.regionID})
                  </Typography>
                </Typography>
                <TransferDisplayUsage
                  pullUsagePct={pool.pct}
                  quota={pool.quota}
                  used={pool.used}
                />
              </Box>
            ))}
          </>
        )}
        {/**
         *  General Information about Transfer Pools & Docs Link
         */}
        <Typography marginBottom={theme.spacing()} marginTop={theme.spacing(3)}>
          <strong>
            Your account&rsquo;s monthly network transfer allotment will reset
            in {daysRemainingInMonth} days.
          </strong>
        </Typography>
        <Typography marginBottom={theme.spacing()} marginTop={theme.spacing()}>
          Your account&rsquo;s network transfer pool adds up all the included
          transfer associated with active Linode services on your account and is
          prorated based on service creation.
        </Typography>
        <Typography>{transferQuotaDocsText}</Typography>
      </Dialog>
    );
  }
);

const StyledDivider = styled(Divider, {
  label: 'TransferDisplayDialogDivider',
})(({ theme }) => ({
  borderColor: theme.color.border3,
  marginBottom: theme.spacing(2),
  marginLeft: theme.spacing(-3),
  marginTop: theme.spacing(3),
  width: `calc(100% + ${theme.spacing(6)})`,
}));
