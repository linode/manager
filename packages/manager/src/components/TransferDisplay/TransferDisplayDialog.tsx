import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';

import { DocsLink } from '../DocsLink/DocsLink';
import { TransferDisplayUsage } from './TransferDisplayUsage';
import { NETWORK_TRANSFER_QUOTA_DOCS_LINKS } from './constants';
import { getDaysRemaining } from './utils';

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

    const transferQuotaDocsText =
      used === 0
        ? 'Compute instances, NodeBalancers, and Object Storage include network transfer.'
        : 'View products and services that include network transfer, and learn how to optimize network usage to avoid billing surprises.';

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
        <Typography
          data-testid="general-transfer-pool-display"
          fontFamily={theme.font.bold}
          marginBottom={theme.spacing()}
        >
          Global Network Transfer Pool
        </Typography>
        <TransferDisplayUsage
          pullUsagePct={generalPoolUsagePct}
          quota={quota}
          used={used}
        />
        <Divider
          sx={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(3) }}
        />
        {/**
         *  Region-specific Transfer Pool Display
         */}
        {regionTransferPools.length > 0 && (
          <>
            <Typography
              data-testid="region-transfer-pool-display"
              fontFamily={theme.font.bold}
              marginBottom={theme.spacing()}
            >
              Datacenter-specific Network Transfer Pools
            </Typography>
            <Typography
              marginBottom={theme.spacing()}
              marginTop={theme.spacing()}
            >
              In some regions, the monthly network transfer is calculated and
              tracked independently. These regions are listed below. Transfer
              overages will be billed separately.
            </Typography>

            {regionTransferPools.map((pool, key) => (
              <Box
                key={`transfer-pool-region-${key}`}
                marginTop={theme.spacing(2)}
              >
                <Typography
                  fontFamily={theme.font.bold}
                  fontSize={theme.typography.body2.fontSize}
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
