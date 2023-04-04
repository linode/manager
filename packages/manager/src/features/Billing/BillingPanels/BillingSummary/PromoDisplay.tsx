import * as React from 'react';
import Box from 'src/components/core/Box';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HelpIcon from 'src/components/HelpIcon';
import Typography from 'src/components/core/Typography';
import { useTheme } from '@mui/material/styles';
import {
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
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <Box display="flex" alignItems="center">
            <Typography
              variant="h3"
              sx={{
                color: theme.palette.text.primary,
                wordBreak: 'break-word',
              }}
            >
              {summary}
            </Typography>
            <HelpIcon
              sx={{
                padding: `0px 8px`,
              }}
              text={description}
            />
          </Box>
          {!Number.isNaN(parsedCreditRemaining) && (
            <Typography
              variant="h3"
              sx={{
                color: theme.color.green,
                marginBottom: '4px',
              }}
            >
              <Currency quantity={parsedCreditRemaining} /> remaining
            </Typography>
          )}
        </Box>
        {expire_dt && (
          <Typography>
            Expires: <DateTimeDisplay value={expire_dt} displayTime={false} />
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
