import * as React from 'react';
import AkamaiWaveOnlyIcon from 'src/assets/icons/providers/akamai-logo-rgb-waveOnly.svg';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import ExternalLink from 'src/components/ExternalLink';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'src/components/Link';
import Typography from 'src/components/core/Typography';
import useFlags from 'src/hooks/useFlags';
import { TPADialog } from './TPADialog';
import { TPAProvider } from '@linode/api-v4/lib/profile';
import { useTheme } from '@mui/material/styles';
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
        <StyledProvidersListGrid spacing={2} container>
          {providersIncludingLinode.map((thisProvider) => {
            const ProviderIcon = icons[thisProvider.name];
            const isProviderEnabled = props.authType === thisProvider.name;

            return (
              <Grid xs={12} sm={6} md={4} key={thisProvider.displayName}>
                <StyledButton
                  data-testid={`Button-${thisProvider.displayName}`}
                  disabled={isProviderEnabled}
                  isButtonEnabled={isProviderEnabled}
                  onClick={() => {
                    handleProviderChange(thisProvider.name);
                  }}
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
            <Divider spacingTop={24} spacingBottom={16} />
            <Typography variant="h3">
              {currentProvider.displayName} Authentication
            </Typography>
            <StyledNotice spacingBottom={16} spacingTop={16} warning>
              Your login credentials are currently managed via{' '}
              {currentProvider.displayName}.
            </StyledNotice>
            <StyledCopy variant="body1">
              If you need to reset your password or set up Two-Factor
              Authentication (2FA), please visit the{' '}
              <ExternalLink
                hideIcon
                link={currentProvider.href}
                text={`${currentProvider.displayName}` + ` website`}
              />
              .
            </StyledCopy>
            <StyledCopy variant="body1" style={{ marginBottom: 8 }}>
              To disable {currentProvider.displayName} authentication and log in
              using your Linode credentials, click the Linode button above.
              We&rsquo;ll send you an e-mail with instructions on how to reset
              your password.
            </StyledCopy>
          </div>
        ) : null}
      </StyledRootContainer>
      <TPADialog
        currentProvider={currentProvider}
        newProvider={newProvider}
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};
