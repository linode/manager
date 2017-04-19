import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { getLinode } from './IndexPage';
import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resetPassword, rescueLinode } from '~/api/linodes';
import { ConfirmModalBody } from 'linode-components/modals';
import { Form, FormGroup, SubmitButton, Select, PasswordInput } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';
import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { RescueMode, ResetRootPassword } from '../components';
import { selectLinode } from '../utilities';


export class RescuePage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { dispatch, linode } = this.props;

    return (
      <div className="row">
        <div className="col-sm-6">
          <RescueMode dispatch={dispatch} linode={linode} />
        </div>
        <div className="col-sm-6">
          <ResetRootPassword dispatch={dispatch} linode={linode} />
        </div>
      </div>
    );
  }
}

RescuePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(RescuePage);
