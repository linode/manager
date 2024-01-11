import { Box } from '@mui/system';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { InputLabel } from 'src/components/InputLabel';
import { Tooltip } from 'src/components/Tooltip';

export interface Props {
  text: string;
}

export const CopyAll = (props: Props) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const { text } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <InputLabel>S3 Endpoint Hostnames</InputLabel>
      <Tooltip
        className="copy-tooltip"
        data-qa-copied
        placement="top"
        title={copied ? 'Copied!' : 'Copy'}
      >
        <StyledLinkButton
          aria-label={`Copy ${text} to clipboard`}
          name={text}
          onClick={handleIconClick}
          type="button"
        >
          Copy all
        </StyledLinkButton>
      </Tooltip>
    </Box>
  );
};
