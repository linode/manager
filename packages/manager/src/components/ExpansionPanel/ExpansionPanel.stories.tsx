import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Button from 'src/components/Button';
import ActionsPanel from '../ActionsPanel';
import ExpansionPanel from './ExpansionPanel';

class AsyncContentExample extends React.Component {
  state = {
    loading: false,
    data: ''
  };

  handleToggleExpand = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.setState({ loading: true });
      const myPromise = () =>
        new Promise(resolve => setTimeout(() => resolve(), 2000));
      myPromise().then(() =>
        this.setState({
          data: 'Your patience has been rewarded',
          loading: false
        })
      );
    }
  };

  renderContent = () => {
    if (this.state.loading) {
      return (
        <div style={{ textAlign: 'center', padding: '1em' }}>Loading...</div>
      );
    }
    return (
      <div style={{ textAlign: 'center', padding: '1em' }}>
        {this.state.data}
      </div>
    );
  };

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
  .add('Interactive', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel heading="The best Linode department is?">
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
    </div>
  ))
  .add('Warning!', () => (
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <ExpansionPanel
        warning="Careful now..."
        heading="This is a warning"
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
        heading="Creating a new linode"
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
      <Button data-qa-save buttonType="primary">
        Save
      </Button>
      <Button data-qa-cancel buttonType="secondary" className="cancel">
        Cancel
      </Button>
    </ActionsPanel>
  );
};
