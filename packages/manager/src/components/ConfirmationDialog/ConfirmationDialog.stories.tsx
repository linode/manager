import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from './ConfirmationDialog';

class Example extends React.Component {
  state = { open: false };

  toggle = (open: boolean) => this.setState({ open });

  decline = (e: React.MouseEvent<any>) => {
    this.toggle(false);
    action('declined')(e);
  };

  confirm = (e: React.MouseEvent<any>) => {
    this.toggle(false);
    action('confirmed')(e);
  };

  renderActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button onClick={this.decline} data-qa-dialog-cancel>
            Cancel
          </Button>
          <Button onClick={this.confirm} data-qa-dialog-confirm>
            Continue
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };

  handleOpenDialog = () => {
    this.setState({ open: true });
  };

  handleCloseDialog = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.handleOpenDialog} data-qa-dialog-button>
          Do something!
        </Button>
        <ConfirmationDialog
          open={this.state.open}
          onClose={this.handleCloseDialog}
          title="Are you sure you wanna?"
          actions={this.renderActions}
        >
          <div>stuff stuff stuff</div>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}
storiesOf('Confirmation Dialogs', module).add('Simple Confirmation', () => (
  <Example />
));
