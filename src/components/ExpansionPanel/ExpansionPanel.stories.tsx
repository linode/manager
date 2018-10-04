import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Button from '@material-ui/core/Button';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ActionsPanel from '../ActionsPanel';
import ExpansionPanel from './ExpansionPanel';

class AsyncContentExample extends React.Component {
  state = {
    loading: false,
    data: '',
  }

  handleToggleExpand = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.setState({ loading: true });
      const myPromise = () => new Promise((resolve) => setTimeout(() => resolve(), 2000));
      myPromise().then(() =>
        this.setState({
          data: 'Your patience has been rewarded',
          loading: false,
        }))
    }
  }

  renderContent = () => {
    if (this.state.loading) {
      return <div style={{ textAlign: 'center', padding: '1em' }}>Loading...</div>
    }
    return (
      <div style={{ textAlign: 'center', padding: '1em' }}>{this.state.data}</div>
    )
  }

  render() {
    return (
      <div
        style={{
          padding: 20,
          backgroundColor: '#f4f4f4'
        }}
      >
        <ExpansionPanel
          heading="Open to Reveal Asynchronously Loaded Content"
          onChange={this.handleToggleExpand}
        >
          {this.renderContent()}
        </ExpansionPanel>
      </div>
    );
  }
}

storiesOf('ExpansionPanel', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel heading="Why is Linode the best?">
        <p>Customer service!</p>
      </ExpansionPanel>
      <ExpansionPanel heading="Why is Linode the best?">
        <p>Customer service!</p>
      </ExpansionPanel>
    </div>
  ))
  .add('Success!', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel
        success="You did it!"
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
      <ExpansionPanel
        success="You did it!"
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
    </div>
  ))
  .add('Warning!', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel
        warning="Careful now..."
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
      <ExpansionPanel
        warning="Careful now..."
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
    </div>
  ))
  .add('Error!', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel
        error="Oh no! Something broke!"
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
      <ExpansionPanel
        error="Oh no! Something broke!"
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </ExpansionPanel>
    </div>
  ))
  .add('Asynchronous Content', () => <AsyncContentExample />);

const renderActions = () => {
  return (
    <ActionsPanel>
      <Button variant="raised" color="primary">Save</Button>
      <Button
        variant="raised"
        color="secondary"
        className="cancel"
      >
        Cancel
    </Button>
    </ActionsPanel>
  )
}
