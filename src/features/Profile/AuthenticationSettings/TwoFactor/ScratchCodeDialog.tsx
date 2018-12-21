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
      scratchCode
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
          {`Here is your scratch code. Please note that you can only use this code once.
          This is the only time it will appear. Be sure to make a note of it and keep it
          secure:`}
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
