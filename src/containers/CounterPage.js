import React, { Component } from 'react';
import Counter from '../components/Counter';
import { increment, decrement } from '../actions/counter';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class CounterPage extends Component {
  render() {
    const { dispatch, counter } = this.props;
    return (
      <div>
        <h1>
        Counter page
        </h1>
        <Counter counter={counter}
          increment={() => dispatch(increment())}
          decrement={() => dispatch(decrement())} />
        <Link to='/'>Back</Link>
      </div>
    );
  }
}

function select(state) {
  return { counter: state.counter };
}

export default connect(select)(CounterPage);
