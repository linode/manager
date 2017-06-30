import React, { Component, PropTypes } from 'react';

import { Form, FormGroup, SubmitButton } from 'linode-components/forms';

import { EmitEvent } from 'linode-components/utils';
import { takeBackup } from '~/api/backups';
import { dispatchOrStoreErrors } from '~/api/util';
import { FormSummary } from 'linode-components/forms';


export default class TakeSnapshot extends Component {
  constructor() {
    super();

    this.state = { errors: {}, loading: false };
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => takeBackup(linode.id),
      () => EmitEvent('button:submit', 'Submit', 'take snapshot', 'linode'),
    ]));
  }

  render() {
    const { errors, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup className="row">
          <div className="offset-sm-3 col-sm-9">
            <SubmitButton
              disabled={loading}
              disabledChildren={"Taking snapshot"}
            >Take snapshot</SubmitButton>
            <FormSummary errors={errors} success="Snapshot started." />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

TakeSnapshot.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
