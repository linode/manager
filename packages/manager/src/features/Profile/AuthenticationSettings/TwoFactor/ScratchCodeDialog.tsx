import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  open: boolean;
  closeDialog: () => void;
  scratchCode: string;
}

class ScratchCodeDialog extends React.PureComponent<Props, {}> {
  render() {
    const { open, closeDialog, scratchCode } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        title={`Scratch Code`}
        onClose={closeDialog}
        actions={<DialogActions closeDialog={this.props.closeDialog} />}
      >
        <Typography>
          {`This scratch code can be used in place of two-factor authentication in the event
          you cannot access your two-factor authentication device. It is limited to a one-time
          use. Be sure to make a note of it and keep it secure, as this is the only time it
          will appear:`}
        </Typography>
        <Typography
          style={{
            marginTop: '16px'
          }}
          variant="h5"
        >
          {scratchCode}
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default ScratchCodeDialog;

interface ActionsProps {
  closeDialog: () => void;
}

class DialogActions extends React.PureComponent<ActionsProps, {}> {
  render() {
    return (
      <ActionsPanel>
        <Button
          type="secondary"
          onClick={this.props.closeDialog}
          data-qa-submit
        >
          Got it
        </Button>
      </ActionsPanel>
    );
  }
}
