import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';

import { DocsLink } from '../DocsLink/DocsLink';
import { TransferDisplayDialogHeader } from './TransferDisplayDialogHeader';
import { TransferDisplayUsage } from './TransferDisplayUsage';
import { NETWORK_TRANSFER_QUOTA_DOCS_LINKS } from './constants';
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
        sx={{}}
        title="Monthly Network Transfer Pool"
      >
        {/**
         *  Global Transfer Pool Display
         */}
        <TransferDisplayDialogHeader
          tooltipText={`The Global Pool includes transfer associated with active services in all regions${
            listOfOtherRegionTransferPools.length > 0
              ? ` except for ${otherRegionPools}.`
              : '.'
          }
          `}
          dataTestId="global-transfer-pool-header"
          headerText="Global Network Transfer Pool"
        />
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
                  fontFamily={theme.font.bold}
                  marginBottom={theme.spacing()}
                >
                  {pool.regionName}{' '}
                  <Typography component="span">({pool.regionID})</Typography>
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
        <Box marginTop={theme.spacing(2)}>
          <DocsLink
            href={NETWORK_TRANSFER_QUOTA_DOCS_LINKS}
            label="Network Transfer Usage and Costs"
          />
        </Box>
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
