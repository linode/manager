import React, { Component, PropTypes } from 'react';

export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  render() {
    return (
      <div>Longview details</div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
};
