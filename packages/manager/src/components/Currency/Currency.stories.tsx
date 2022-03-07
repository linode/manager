import * as React from 'react';
import Currency from './Currency';

class Example extends React.Component<{}, {}> {
  render() {
    return (
      <div style={{ margin: 24 }}>
        <div>
          <Currency quantity={0} />
        </div>
        <div>
          <Currency quantity={5} />
        </div>
        <div>
          <Currency quantity={99.99} />
        </div>
        <div>
          <Currency quantity={-5} />
        </div>
        <div>
          <Currency quantity={-5} wrapInParentheses />
        </div>
        <div>
          <Currency quantity={5} decimalPlaces={3} />
        </div>
        <div>
          <Currency quantity={99.999} decimalPlaces={3} />
        </div>
      </div>
    );
  }
}

export default {
  title: 'Core/Typography/Currency',
};

export const _Example = () => <Example />;
