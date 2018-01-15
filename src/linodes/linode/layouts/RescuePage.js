import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setSource } from '~/actions/source';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';

import { RescueMode, ResetRootPassword } from '../components';
import { selectLinode } from '../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class RescuePage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { dispatch, linode } = this.props;

    return (
      <div className="row">
        <ChainedDocumentTitle title="Rescue" />
        <section className="col-lg-6 col-md-12 col-sm-12">
          <RescueMode dispatch={dispatch} linode={linode} />
        </section>
        <section className="col-lg-6 col-md-12 col-sm-12">
          <ResetRootPassword dispatch={dispatch} linode={linode} />
        </section>
      </div>
    );
  }
}

RescuePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

const preloadReqeust = async (dispatch, { match: { params: { linodeLabel } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
  await Promise.all([
    api.linodes.disks,
    api.linodes.volumes,
  ].map(o => dispatch(o.all([id]))));
};

export default compose(
  connect(selectLinode),
  Preload(preloadReqeust)
)(RescuePage);
