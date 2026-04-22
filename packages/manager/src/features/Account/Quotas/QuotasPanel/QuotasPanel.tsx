import { Divider, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { QuotasTable } from 'src/features/Account/Quotas/QuotasPanel/QuotasTable';
import { ScopeValueSelect } from 'src/features/Account/Quotas/QuotasPanel/ScopeValueSelect';

import type { Theme } from '@mui/material';
import type {
  QuotaScope,
  QuotaService,
} from 'src/features/Account/Quotas/quotaServices';

interface QuotasPanelProps {
  scope: QuotaScope;
  service: QuotaService;
}

const quotaLabels: Record<QuotaScope, string> = {
  global: 'global',
  region: 'region',
  'obj-endpoint': 'endpoint',
};

export const QuotasPanel: React.FC<QuotasPanelProps> = ({ service, scope }) => {
  const [scopeValue, setScopeValue] = React.useState<null | string>(null);

  // reset scope value in case scope or service changes
  React.useEffect(() => {
    setScopeValue(null);
  }, [scope, service]);

  return (
    <Paper
      sx={(theme: Theme) => ({
        marginTop: theme.spacingFunction(16),
      })}
      variant="outlined"
    >
      <Typography variant="h2">
        {service.label}:{' '}
        {`${scope === 'global' ? '' : 'per-'}${quotaLabels[scope]}`}
      </Typography>

      {scope !== 'global' && (
        <>
          <Typography marginBottom={2} marginTop={2}>
            View your {service.label} quotas by applying the{' '}
            {quotaLabels[scope]} filter below.
          </Typography>

          <Stack spacing={1}>
            <ScopeValueSelect
              additionalProps={service.scopes[scope]?.scopeValueSelectorProps}
              onChange={(value) => setScopeValue(value)}
              scope={scope}
              sx={{ flexGrow: 1, mr: 2 }}
            />
          </Stack>

          <Divider spacingBottom={40} spacingTop={40} />

          <Stack
            direction="row"
            justifyContent="space-between"
            marginBottom={2}
          >
            <Typography variant="h3">Quotas</Typography>
          </Stack>

          {scope === 'obj-endpoint' ? (
            <Typography>
              If you need to increase a quota, select{' '}
              <strong>Request Increase</strong> from the Actions menu. Usage can
              also be found using third-party tools like{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/using-s3cmd-with-object-storage#check-disk-usage-by-bucket">
                s3cmd
              </Link>
              .
            </Typography>
          ) : (
            <Typography>
              If you need to increase a quota, select{' '}
              <strong>Request Increase</strong> from the Actions menu.
            </Typography>
          )}
        </>
      )}

      <QuotasTable scope={scope} scopeValue={scopeValue} service={service} />
    </Paper>
  );
};
