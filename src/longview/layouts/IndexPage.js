import React, { Component, PropTypes } from 'react';

export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  render() {
    return (
      <div>Longview</div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
};
