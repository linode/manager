import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { replaceNewlinesWithLineBreaks } from 'src/utilities/replaceNewlinesWithLineBreaks';

import { Box } from '../Box';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { LinearProgress } from '../LinearProgress';
import { Link } from '../Link';
import { Stack } from '../Stack';
import { Typography } from '../Typography';
import { useCreateFirewallFromTemplate } from './useCreateFirewallFromTemplate';

import type { Firewall } from '@linode/api-v4';

interface GenerateFirewallDialogProps {
  onClose: () => void;
  onFirewallGenerated?: (firewall: Firewall) => void;
  open: boolean;
}

export type DialogState =
  | ErrorDialogState
  | ProgressDialogState
  | PromptDialogState
  | SuccessDialogState;

interface BaseDialogState {
  step: 'error' | 'progress' | 'prompt' | 'success';
}

interface PromptDialogState extends BaseDialogState {
  step: 'prompt';
}

interface ProgressDialogState extends BaseDialogState {
  progress: number;
  step: 'progress';
}

interface SuccessDialogState extends BaseDialogState {
  firewall: Firewall;
  step: 'success';
}

interface ErrorDialogState extends BaseDialogState {
  error: string;
  step: 'error';
}

export const GenerateFirewallDialog = (props: GenerateFirewallDialogProps) => {
  const { onClose, onFirewallGenerated, open } = props;

  const [dialogState, setDialogState] = React.useState<DialogState>({
    step: 'prompt',
  });

  const dialogProps = {
    onClose,
    onFirewallGenerated,
    setDialogState,
  };

  return (
    <Dialog
      onClose={onClose}
      onTransitionExited={() => setDialogState({ step: 'prompt' })}
      open={open}
      title="Generate an Akamai Compliant Firewall"
    >
      {dialogState.step === 'prompt' && (
        <PromptDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'progress' && (
        <ProgressDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'success' && (
        <SuccessDialogContent {...dialogProps} state={dialogState} />
      )}
      {dialogState.step === 'error' && (
        <ErrorDialogContent {...dialogProps} state={dialogState} />
      )}
    </Dialog>
  );
};

interface GenerateFirewallDialogContentProps<State extends DialogState> {
  onClose: () => void;
  onFirewallGenerated?: (firewall: Firewall) => void;
  setDialogState: (state: DialogState) => void;
  state: State;
}

const PromptDialogContent = (
  props: GenerateFirewallDialogContentProps<PromptDialogState>
) => {
  const { onFirewallGenerated, setDialogState } = props;
  const flags = useFlags();
  const dialogCopy = flags.secureVmCopy?.generatePrompt;
  const { createFirewallFromTemplate } = useCreateFirewallFromTemplate({
    onFirewallGenerated,
    setDialogState,
  });

  return (
    <Stack gap={3}>
      {dialogCopy && (
        <Typography>
          {replaceNewlinesWithLineBreaks(dialogCopy.text)}
          {dialogCopy.link && (
            <>
              {' '}
              <Link external to={dialogCopy.link?.url}>
                {dialogCopy.link?.text}
              </Link>
            </>
          )}
        </Typography>
      )}
      <Box>
        <Button buttonType="primary" onClick={createFirewallFromTemplate}>
          Generate Firewall Now
        </Button>
      </Box>
    </Stack>
  );
};

const ProgressDialogContent = (
  props: GenerateFirewallDialogContentProps<ProgressDialogState>
) => (
  <Stack gap={3}>
    <Typography variant="h2">Generating Firewall</Typography>
    <LinearProgress value={props.state.progress} variant="determinate" />
  </Stack>
);

const SuccessDialogContent = (
  props: GenerateFirewallDialogContentProps<SuccessDialogState>
) => {
  const {
    onClose,
    state: { firewall },
  } = props;

  const flags = useFlags();
  const dialogCopy = flags.secureVmCopy?.generateSuccess;
  const docsLink = flags.secureVmCopy?.generateDocsLink;
  const docsLinkText = 'applied to your Linodes.';

  return (
    <Stack gap={3}>
      <Typography variant="h2">Complete!</Typography>
      <Typography>
        The <Link to={`/firewalls/${firewall.id}`}>{firewall.label}</Link>{' '}
        firewall is ready and can now be{' '}
        {docsLink ? (
          <Link external to={docsLink}>
            {docsLinkText}
          </Link>
        ) : (
          docsLinkText
        )}
      </Typography>
      {dialogCopy && (
        <Typography>
          {replaceNewlinesWithLineBreaks(dialogCopy.text)}
          {dialogCopy.link && (
            <>
              {' '}
              <Link external to={dialogCopy.link?.url}>
                {dialogCopy.link?.text}
              </Link>
            </>
          )}
        </Typography>
      )}
      <Box>
        <Button buttonType="primary" onClick={onClose}>
          OK
        </Button>
      </Box>
    </Stack>
  );
};

const ErrorDialogContent = (
  props: GenerateFirewallDialogContentProps<ErrorDialogState>
) => {
  const {
    onClose,
    onFirewallGenerated,
    setDialogState,
    state: { error },
  } = props;

  const { createFirewallFromTemplate } = useCreateFirewallFromTemplate({
    onFirewallGenerated,
    setDialogState,
  });

  return (
    <Stack gap={3}>
      <Typography variant="h2">An error occurred</Typography>
      <Typography>{error}</Typography>
      <Stack direction="row" gap={2}>
        <Button buttonType="primary" onClick={createFirewallFromTemplate}>
          Retry
        </Button>
        <Button buttonType="secondary" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Stack>
  );
};
