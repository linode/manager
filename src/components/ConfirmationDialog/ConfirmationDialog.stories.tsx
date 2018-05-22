import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { checkA11y } from '@storybook/addon-a11y';

import Button from 'material-ui/Button';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ConfirmationDialog from './ConfirmationDialog';

class Example extends React.Component {
  state = { open: false };

  toggle = (open: boolean) => this.setState({ open });

  decline = (e: React.MouseEvent<any>) => {
    this.toggle(false);
    action('declined')(e);
  }

  confirm = (e: React.MouseEvent<any>) => {
    this.toggle(false);
    action('confirmed')(e);
  }

  renderActions = () => {
    return (
      <React.Fragment>
        <Button onClick={this.decline}> No!</Button>
        <Button onClick={this.confirm}>Yes!</Button>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Button onClick={() => { this.setState({ open: true }); }}>Do something!</Button>
        <ConfirmationDialog
          open={this.state.open}
          onClose={() => { this.setState({ open: false }); }}
          title="Are you sure you wanna?"
          actions={this.renderActions}>
          <div>stuff stuff stuff</div>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}
storiesOf('Dialogs', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(checkA11y)
  .add('Simple Confirmation', () => (<Example />));
