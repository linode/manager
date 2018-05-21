import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Button from 'material-ui/Button';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ExpansionPanel from './ExpansionPanel';
import ActionsPanel from '../ActionsPanel';

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
      actions={props => (
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
    >
      <p>Customer service!</p>
    </ExpansionPanel>
    <ExpansionPanel
      success="You did it!"
      heading="Why is Linode the best?"
      actions={props => (
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
      actions={props => (
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
    >
      <p>Customer service!</p>
    </ExpansionPanel>
    <ExpansionPanel
      warning="Careful now..."
      heading="Why is Linode the best?"
      actions={props => (
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
      actions={props => (
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
    >
      <p>Customer service!</p>
    </ExpansionPanel>
    <ExpansionPanel
      error="Oh no! Something broke!"
      heading="Why is Linode the best?"
      actions={props => (
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
    >
      <p>Customer service!</p>
    </ExpansionPanel>
  </div>
));
