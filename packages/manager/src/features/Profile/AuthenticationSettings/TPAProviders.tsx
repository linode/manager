import { Box, Divider, Notice, Paper, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import AkamaiWaveOnlyIcon from 'src/assets/icons/providers/akamai-logo-rgb-waveOnly.svg';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import { Link } from 'src/components/Link';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useFlags } from 'src/hooks/useFlags';

import { TPADialog } from './TPADialog';

import type { TPAProvider } from '@linode/api-v4/lib/profile';

interface Props {
  authType: TPAProvider;
}

const icons: Record<TPAProvider, any> = {
  github: GitHubIcon,
  google: GoogleIcon,
  password: AkamaiWaveOnlyIcon,
};

const linode = {
  displayName: 'Cloud Manager',
  href: '',
  icon: AkamaiWaveOnlyIcon,
  name: 'password' as TPAProvider,
};

export const TPAProviders = (props: Props) => {
  const flags = useFlags();

  // Get list of providers from LaunchDarkly
  const providers = flags.tpaProviders ?? [];
  const providersIncludingLinode = [{ ...linode }, ...providers];
  const currentProvider =
    providers.find((thisProvider) => thisProvider.name === props.authType) ??
    linode;
  const isThirdPartyAuthEnabled = props.authType !== 'password';
  const [isDialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [newProvider, setNewProvider] = React.useState<TPAProvider>(
    providers[0]?.name
  );

  const handleProviderChange = (newProviderName: TPAProvider) => {
    setNewProvider(newProviderName);
    setDialogOpen(true);
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h3">Login Method</Typography>
        <Typography sx={{ maxWidth: '960px' }}>
          You can use your Cloud Manager credentials or another provider such as
          Google or GitHub to log in to your Cloud Manager account. More
          information is available in{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/enable-third-party-authentication">
            How to Enable Third Party Authentication on Your User Account
          </Link>
          . We strongly recommend setting up Two-Factor Authentication (2FA).
        </Typography>
        <Grid container pt={2} spacing={2}>
          {providersIncludingLinode.map((thisProvider) => {
            const ProviderIcon = icons[thisProvider.name];
            const isProviderEnabled = props.authType === thisProvider.name;

            return (
              <SelectionCard
                gridSize={{
                  md: 4,
                  sm: 6,
                  xs: 12,
                }}
                renderVariant={
                  isProviderEnabled ? () => <EnabledIcon /> : undefined
                }
                tooltip={
                  isProviderEnabled
                    ? `${thisProvider.displayName} is your current authentication provider.`
                    : undefined
                }
                data-testid={`Button-${thisProvider.displayName}`}
                disabled={isProviderEnabled}
                heading={thisProvider.displayName}
                key={thisProvider.displayName}
                onClick={() => handleProviderChange(thisProvider.name)}
                renderIcon={() => <ProviderIcon height={32} width={32} />}
                subheadings={isProviderEnabled ? ['Enabled'] : []}
                tooltipPlacement="bottom"
              />
            );
          })}
        </Grid>
        {isThirdPartyAuthEnabled && (
          <Box data-testid={`Notice-${currentProvider.displayName}`}>
            <Divider spacingBottom={16} spacingTop={24} />
            <Typography variant="h3">
              {currentProvider.displayName} Authentication
            </Typography>
            <Notice spacingBottom={16} spacingTop={16} variant="warning">
              Your login credentials are currently managed via{' '}
              {currentProvider.displayName}.
            </Notice>
            <Typography variant="body1">
              If you need to reset your password or set up Two-Factor
              Authentication (2FA), please visit the{' '}
              <Link external to={currentProvider.href}>
                {`${currentProvider.displayName}` + ` website`}
              </Link>
              .
            </Typography>
            <Typography variant="body1">
              To disable {currentProvider.displayName} authentication and log in
              using your Cloud Manager credentials, click the Cloud Manager
              button above. We&rsquo;ll send you an e-mail with instructions on
              how to reset your password.
            </Typography>
          </Box>
        )}
      </Stack>
      <TPADialog
        currentProvider={currentProvider}
        newProvider={newProvider}
        onClose={() => setDialogOpen(false)}
        open={isDialogOpen}
      />
    </Paper>
  );
};
