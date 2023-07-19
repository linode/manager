import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Dialog } from 'src/components/Dialog/Dialog';
import { sendCLIClickEvent } from 'src/utilities/analytics';

export interface ImageUploadSuccessDialogProps {
  analyticsKey?: string;
  command: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LinodeCLIModal = React.memo(
  (props: ImageUploadSuccessDialogProps) => {
    const { analyticsKey, command, isOpen, onClose } = props;

    return (
      <StyledLinodeCLIModal
        fullWidth
        onClose={onClose}
        open={isOpen}
        title="Upload Image with the Linode CLI"
      >
        <StyledCommandDisplay>
          <StyledCLIText>{command}</StyledCLIText>{' '}
          <StyledCopyTooltip
            onClickCallback={
              analyticsKey ? () => sendCLIClickEvent(analyticsKey) : undefined
            }
            text={command}
          />
        </StyledCommandDisplay>
      </StyledLinodeCLIModal>
    );
  }
);

const StyledLinodeCLIModal = styled(Dialog, {
  label: 'StyledLinodeCLIModal',
})(({ theme }) => ({
  '& [data-qa-copied]': {
    zIndex: 2,
  },
  padding: `${theme.spacing()} ${theme.spacing(2)}`,
  width: '100%',
}));

const StyledCommandDisplay = styled('div', {
  label: 'StyledCommandDisplay',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.main,
  border: `1px solid ${theme.color.border2}`,
  display: 'flex',
  fontFamily: '"UbuntuMono", monospace, sans-serif',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  lineHeight: 1,
  padding: theme.spacing(),
  position: 'relative',
  whiteSpace: 'nowrap',
  width: '100%',
  wordBreak: 'break-all',
}));

const StyledCLIText = styled('div', {
  label: 'StyledCLIText',
})(() => ({
  height: '1rem',
  overflowX: 'auto',
  overflowY: 'hidden', // For Edge
  paddingRight: 15,
}));

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(() => ({
  '& svg': {
    height: '1em',
    width: '1em',
  },
  display: 'flex',
}));
