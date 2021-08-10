import * as React from 'react';
import { Provider } from 'react-redux';
import Button from 'src/components/Button';
import store from 'src/store';
import ActionsPanel from '../ActionsPanel';
import Accordion from './Accordion';

class AsyncContentExample extends React.Component {
  state = {
    loading: false,
    data: '',
  };

  handleToggleExpand = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.setState({ loading: true });
      const myPromise = () =>
        new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
      myPromise().then(() =>
        this.setState({
          data: 'Your patience has been rewarded',
          loading: false,
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
          backgroundColor: '#f4f4f4',
        }}
      >
        <Accordion
          heading="Open to Reveal Asynchronously Loaded Content"
          onChange={this.handleToggleExpand}
        >
          {this.renderContent()}
        </Accordion>
      </div>
    );
  }
}

export default {
  title: 'UI Elements/Accordion',
};

export const Interactive = () => (
  <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
    <Accordion heading="The best Linode department is?">
      <p>Customer service!</p>
    </Accordion>
  </div>
);

export const Success = () => (
  <Provider store={store}>
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <Accordion
        success="You did it!"
        heading="Why is Linode the best?"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </Accordion>
    </div>
  </Provider>
);

Success.story = {
  name: 'Success!',
};

export const Warning = () => (
  <Provider store={store}>
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <Accordion
        warning="Careful now..."
        heading="This is a warning"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </Accordion>
    </div>
  </Provider>
);

Warning.story = {
  name: 'Warning!',
};

export const Error = () => (
  <Provider store={store}>
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
      <Accordion
        error="Oh no! Something broke!"
        heading="Creating a new linode"
        actions={renderActions}
      >
        <p>Customer service!</p>
      </Accordion>
    </div>
  </Provider>
);

Error.story = {
  name: 'Error!',
};

export const AsynchronousContent = () => <AsyncContentExample />;

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
