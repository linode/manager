import { Box, TooltipIcon, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import type {
  ActivePromotion,
  PromotionServiceType,
} from '@linode/api-v4/lib/account/types';

type PromoDisplayProps = ActivePromotion;

export const SERVICE_TYPES: Partial<Record<PromotionServiceType, string>> = {
  all: 'All',
  backup: 'Backups',
  blockstorage: 'Volumes',
  db_mysql: 'DBaaS',
  ip_v4: 'IPv4',
  linode: 'Linodes',
  linode_disk: 'Storage',
  linode_memory: 'Memory',
  longview: 'Longview',
  managed: 'Managed',
  nodebalancer: 'NodeBalancers',
  objectstorage: 'Object Storage',
  transfer_tx: 'Transfer Overages',
};

const PromoDisplay = React.memo(
  ({
    credit_monthly_cap,
    credit_remaining,
    description,
    expire_dt,
    service_type,
    summary,
  }: PromoDisplayProps) => {
    const theme = useTheme();
    const parsedCreditRemaining = Number.parseFloat(credit_remaining);
    const parsedCreditMonthlyCap = Number.parseFloat(credit_monthly_cap);

    return (
      <Box marginTop="12px">
        <Box
          alignItems="flex-start"
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box alignItems="center" display="flex">
            <Typography
              sx={{
                color: theme.palette.text.primary,
                wordBreak: 'break-word',
              }}
              variant="h3"
            >
              {summary}
            </Typography>
            <TooltipIcon
              status="help"
              sxTooltipIcon={{
                padding: `0px 8px`,
              }}
              text={description}
            />
          </Box>
          {!Number.isNaN(parsedCreditRemaining) && (
            <Typography
              sx={{
                color: theme.color.green,
                marginBottom: '4px',
              }}
              variant="h3"
            >
              <Currency quantity={parsedCreditRemaining} /> remaining
            </Typography>
          )}
        </Box>
        {expire_dt && (
          <Typography>
            Expires: <DateTimeDisplay displayTime={false} value={expire_dt} />
          </Typography>
        )}
        {service_type !== 'all' && SERVICE_TYPES[service_type] && (
          <Typography>Applies to: {SERVICE_TYPES[service_type]}</Typography>
        )}
        {parsedCreditMonthlyCap > 0 && (
          <Typography>
            Monthly cap: <Currency quantity={parsedCreditMonthlyCap} />
          </Typography>
        )}
      </Box>
    );
  }
);

export { PromoDisplay };
