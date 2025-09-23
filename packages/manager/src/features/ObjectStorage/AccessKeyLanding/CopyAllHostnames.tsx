import { Box, InputLabel, LinkButton, Tooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import copy from 'copy-to-clipboard';
import * as React from 'react';

export interface Props {
  hideShowAll?: boolean;
  text: string;
}

export const CopyAllHostnames = (props: Props) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const { hideShowAll = false, text } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
  };

  return (
    <StyledBox>
      <InputLabel sx={{ margin: 0 }}>S3 Endpoint Hostnames</InputLabel>
      {!hideShowAll && (
        <Tooltip
          className="copy-tooltip"
          data-qa-copied
          placement="top"
          title={copied ? 'Copied!' : 'Copy'}
        >
          <LinkButton
            aria-label={`Copy ${text} to clipboard`}
            name={text}
            onClick={handleIconClick}
            type="button"
          >
            Copy all
          </LinkButton>
        </Tooltip>
      )}
    </StyledBox>
  );
};

const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  borderColor: theme.name === 'light' ? theme.color.grey3 : theme.color.black,
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));
