import React, { Component, PropTypes } from 'react';

class Counter extends Component {
  render() {
    const { increment, decrement, counter } = this.props;
    return (
      <div>
        <p>Counter: {counter}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    );
  }
}

Counter.propTypes = {
  increment: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired,
};

export default Counter;
