import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Currency from './Currency';

class Example extends React.Component<{}, {}> {
  render() {
    return (
      <React.Fragment>
        <div style={{ margin: 24 }}>
          <Typography variant="h2" style={{ marginBottom: 6 }}>
            Default (USD):
          </Typography>
          <div>
            <Currency quantity={0} />
          </div>
          <div>
            <Currency quantity={10.5} />
          </div>
          <div>
            <Currency quantity={1999.99} />
          </div>

          <Typography variant="h2" style={{ marginBottom: 6, marginTop: 24 }}>
            Other currencies:
          </Typography>
          <div>
            <Currency quantity={0} currency="EUR" />
          </div>
          <div>
            <Currency quantity={-10.5} currency="BRL" />
          </div>
          <div>
            <Currency quantity={1999.99} currency="CNY" />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

storiesOf('Currency', module).add('Example', () => <Example />);
