import Grid from '@mui/material/Unstable_Grid2';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
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

// @todo: is this URL correct? Are there new docs being written?
const DOC_URL =
  'https://www.linode.com/docs/platform/linode-managed/#adding-the-public-key';

const LinodePubKey = () => {
  const { data, error, isLoading } = useManagedSSHKey();

  const [copied, setCopied] = React.useState<boolean>(false);
  const timeout = React.useRef<NodeJS.Timeout>();

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
        <ErrorState cozy errorText={errorMessage} />
      </StyledErrorStatePaper>
    );
  }

  if (isLoading) {
    return (
      <StyledLoadingStatePaper>
        <StyledCircleProgress mini />
      </StyledLoadingStatePaper>
    );
  }

  return (
    <StyledRootPaper>
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid lg={4} md={3} xs={12}>
          <Box display="flex" flexDirection="row">
            <StyledSSHKeyIcon />
            <Typography variant="h3">Linode Public Key</Typography>
          </Box>
          <Typography>
            You must <Link to={DOC_URL}>install our public SSH key</Link> on all
            managed Linodes so we can access them and diagnose issues.
          </Typography>
        </Grid>
        {/* Hide the SSH key on x-small viewports */}
        <StyledSSHKeyContainerGrid md={6} sm={5} xs={12}>
          <StyledTypography variant="subtitle1">
            {data?.ssh_key || ''}
            {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
            {/* pubKey.slice(0, 160)} . . . */}
          </StyledTypography>
        </StyledSSHKeyContainerGrid>
        <StyledCopyToClipboardGrid lg={2} md={3} sm={4} xs={12}>
          <Button buttonType="secondary" onClick={handleCopy}>
            {!copied ? 'Copy to clipboard' : 'Copied!'}
          </Button>
        </StyledCopyToClipboardGrid>
      </Grid>
    </StyledRootPaper>
  );
};

export default LinodePubKey;
