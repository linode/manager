import * as React from 'react';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Dialog } from 'src/components/Dialog/Dialog';
import { sendCLIClickEvent } from 'src/utilities/ga';
import { styled } from '@mui/material/styles';

export interface ImageUploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  command: string;
  analyticsKey?: string;
}

export const LinodeCLIModal = React.memo(
  (props: ImageUploadSuccessDialogProps) => {
    const { isOpen, onClose, command, analyticsKey } = props;

    return (
      <StyledLinodeCLIModal
        title="Upload Image with the Linode CLI"
        open={isOpen}
        onClose={onClose}
        fullWidth
      >
        <StyledCommandDisplay>
          <StyledCLIText>{command}</StyledCLIText>{' '}
          <StyledCopyTooltip
            text={command}
            onClickCallback={
              analyticsKey ? () => sendCLIClickEvent(analyticsKey) : undefined
            }
          />
        </StyledCommandDisplay>
      </StyledLinodeCLIModal>
    );
  }
);

const StyledLinodeCLIModal = styled(Dialog, {
  label: 'StyledLinodeCLIModal',
})(({ theme }) => ({
  width: '100%',
  padding: `${theme.spacing()} ${theme.spacing(2)}`,
  '& [data-qa-copied]': {
    zIndex: 2,
  },
}));

const StyledCommandDisplay = styled('div', {
  label: 'StyledCommandDisplay',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.bg.main,
  border: `1px solid ${theme.color.border2}`,
  fontSize: '0.875rem',
  lineHeight: 1,
  padding: theme.spacing(),
  whiteSpace: 'nowrap',
  fontFamily: '"UbuntuMono", monospace, sans-serif',
  wordBreak: 'break-all',
  position: 'relative',
  width: '100%',
}));

const StyledCLIText = styled('div', {
  label: 'StyledCLIText',
})(() => ({
  overflowY: 'hidden', // For Edge
  overflowX: 'auto',
  height: '1rem',
  paddingRight: 15,
}));

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(() => ({
  display: 'flex',
  '& svg': {
    width: '1em',
    height: '1em',
  },
}));
