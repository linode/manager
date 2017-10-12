import React, { Component, PropTypes } from 'react';

import longview from '~/api/longview';


export class IndexPage extends Component {
  static async preload({ dispatch }, { lvLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
    await dispatch(longview.stats.get([id]));
  }

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
