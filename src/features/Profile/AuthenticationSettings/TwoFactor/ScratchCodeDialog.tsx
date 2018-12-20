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

class TrustedDevicesDialog extends React.PureComponent<Props, {}> {
  render() {
    const {
      open,
      closeDialog,
    } = this.props;

    return (
      <ConfirmationDialog
        open={open}
        title={`Scratch Code`}
        onClose={closeDialog}
        actions={
          <DialogActions
            closeDialog={this.props.closeDialog}
          />
        }
      >
        <Typography>
          {`Her is your scratch code dummy`}
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default TrustedDevicesDialog;

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
          data-qa-submit>
          Got it
     </Button>
      </ActionsPanel>
    )
  }
}
