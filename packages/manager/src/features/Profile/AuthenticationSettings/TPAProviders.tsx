import { TPAProvider } from '@linode/api-v4/lib/profile';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import AkamaiWaveOnlyIcon from 'src/assets/icons/providers/akamai-logo-rgb-waveOnly.svg';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import { TPADialog } from './TPADialog';
import {
  StyledButton,
  StyledCopy,
  StyledEnabledText,
  StyledNotice,
  StyledProvidersListGrid,
  StyledRootContainer,
} from './TPAProviders.styles';

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
  const theme = useTheme();
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
    <>
      <StyledRootContainer>
        <Typography variant="h3">Login Method</Typography>
        <StyledCopy>
          You can use your Cloud Manager credentials or another provider such as
          Google or GitHub to log in to your Cloud Manager account. More
          information is available in{' '}
          <Link to="https://www.linode.com/docs/guides/third-party-authentication/">
            How to Enable Third Party Authentication on Your User Account
          </Link>
          . We strongly recommend setting up Two-Factor Authentication (2FA).
        </StyledCopy>
        <StyledProvidersListGrid container spacing={2}>
          {providersIncludingLinode.map((thisProvider) => {
            const ProviderIcon = icons[thisProvider.name];
            const isProviderEnabled = props.authType === thisProvider.name;

            return (
              <Grid key={thisProvider.displayName} md={4} sm={6} xs={12}>
                <StyledButton
                  onClick={() => {
                    handleProviderChange(thisProvider.name);
                  }}
                  data-testid={`Button-${thisProvider.displayName}`}
                  disabled={isProviderEnabled}
                  isButtonEnabled={isProviderEnabled}
                >
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                  >
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="row"
                      flexGrow={1}
                    >
                      <ProviderIcon
                        style={{
                          color: '#939598',
                          height: 32,
                          marginRight: theme.spacing(2),
                          width: 32,
                        }}
                      />
                      {thisProvider.displayName}
                      {isProviderEnabled ? (
                        <StyledEnabledText
                          data-testid={`Enabled-${thisProvider.displayName}`}
                        >
                          (Enabled)
                        </StyledEnabledText>
                      ) : null}
                    </Box>
                    {isProviderEnabled ? <EnabledIcon /> : null}
                  </Box>
                </StyledButton>
              </Grid>
            );
          })}
        </StyledProvidersListGrid>
        {isThirdPartyAuthEnabled ? (
          <div data-testid={`Notice-${currentProvider.displayName}`}>
            <Divider spacingBottom={16} spacingTop={24} />
            <Typography variant="h3">
              {currentProvider.displayName} Authentication
            </Typography>
            <StyledNotice spacingBottom={16} spacingTop={16} variant="warning">
              Your login credentials are currently managed via{' '}
              {currentProvider.displayName}.
            </StyledNotice>
            <StyledCopy variant="body1">
              If you need to reset your password or set up Two-Factor
              Authentication (2FA), please visit the{' '}
              <Link external to={currentProvider.href}>
                {`${currentProvider.displayName}` + ` website`}
              </Link>
              .
            </StyledCopy>
            <StyledCopy style={{ marginBottom: 8 }} variant="body1">
              To disable {currentProvider.displayName} authentication and log in
              using your Cloud Manager credentials, click the Cloud Manager
              button above. We&rsquo;ll send you an e-mail with instructions on
              how to reset your password.
            </StyledCopy>
          </div>
        ) : null}
      </StyledRootContainer>
      <TPADialog
        currentProvider={currentProvider}
        newProvider={newProvider}
        onClose={() => setDialogOpen(false)}
        open={isDialogOpen}
      />
    </>
  );
};
