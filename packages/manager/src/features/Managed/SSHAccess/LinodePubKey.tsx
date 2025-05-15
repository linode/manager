import { usePreferences } from '@linode/queries';
import { Button, ErrorState, Stack, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { MaskableTextAreaCopy } from 'src/components/MaskableText/MaskableTextArea';
import {
  StyledVisibilityHideIcon,
  StyledVisibilityShowIcon,
} from 'src/features/Billing/BillingPanels/ContactInfoPanel/ContactInformation.styles';
import { useManagedSSHKey } from 'src/queries/managed/managed';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import {
  StyledCircleProgress,
  StyledCopyToClipboardGrid,
  StyledErrorStatePaper,
  StyledLoadingStatePaper,
  StyledRootPaper,
  StyledSSHKeyContainerGrid,
  StyledSSHKeyIcon,
  StyledTypography,
} from './LinodePubKey.styles';

import type { Theme } from '@mui/material';

const DOC_URL =
  'https://techdocs.akamai.com/cloud-computing/docs/configure-ssh-access-for-managed-services';

const LinodePubKey = () => {
  const { data, error, isLoading } = useManagedSSHKey();
  const { data: preferences } = usePreferences();

  const [copied, setCopied] = React.useState<boolean>(false);
  const [isSSHKeyMasked, setIsSSHKeyMasked] = React.useState(
    preferences?.maskSensitiveData
  );
  const timeout = React.useRef<NodeJS.Timeout>();
  const matchesSmDownBreakpoint = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('sm')
  );

  React.useEffect(() => {
    if (copied) {
      timeout.current = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [copied]);

  const handleCopy = () => {
    if (data) {
      setCopied(true);
      copy(data.ssh_key);
    }
  };

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return (
      <StyledErrorStatePaper>
        <ErrorState errorText={errorMessage} />
      </StyledErrorStatePaper>
    );
  }

  if (isLoading) {
    return (
      <StyledLoadingStatePaper>
        <StyledCircleProgress size="sm" />
      </StyledLoadingStatePaper>
    );
  }

  return (
    <StyledRootPaper>
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Grid
          size={{
            lg: 4,
            md: 3,
            xs: 12,
          }}
        >
          <Stack flexDirection="row">
            <StyledSSHKeyIcon />
            <Typography variant="h3">Linode Public Key</Typography>
          </Stack>
          <Typography>
            You must <Link to={DOC_URL}>install our public SSH key</Link> on all
            managed Linodes so we can access them and diagnose issues.
          </Typography>
        </Grid>
        <StyledSSHKeyContainerGrid size={{ md: 6, sm: 7, xs: 12 }}>
          <StyledTypography sx={{ fontSize: 14 }}>
            {preferences?.maskSensitiveData && isSSHKeyMasked ? (
              <MaskableTextAreaCopy />
            ) : (
              data?.ssh_key || ''
            )}
            {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
            {/* pubKey.slice(0, 160)} . . . */}
          </StyledTypography>
        </StyledSSHKeyContainerGrid>
        <StyledCopyToClipboardGrid size={{ lg: 2, md: 3, sm: 4, xs: 12 }}>
          <Stack
            flexDirection={matchesSmDownBreakpoint ? 'row' : 'column'}
            marginLeft={matchesSmDownBreakpoint ? 'auto' : undefined}
          >
            <Button buttonType="secondary" onClick={handleCopy}>
              {!copied ? 'Copy to clipboard' : 'Copied!'}
            </Button>
            {preferences?.maskSensitiveData && (
              <Button onClick={() => setIsSSHKeyMasked(!isSSHKeyMasked)}>
                {isSSHKeyMasked ? (
                  <StyledVisibilityShowIcon />
                ) : (
                  <StyledVisibilityHideIcon />
                )}
                {isSSHKeyMasked ? 'Show Key' : 'Hide Key'}
              </Button>
            )}
          </Stack>
        </StyledCopyToClipboardGrid>
      </Grid>
    </StyledRootPaper>
  );
};

export default LinodePubKey;
