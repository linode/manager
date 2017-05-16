import React, { Component, PropTypes } from 'react';

import { Form, FormGroup, SubmitButton } from 'linode-components/forms';

import { takeBackup } from '~/api/backups';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class TakeSnapshot extends Component {
  constructor() {
    super();

    this.state = { errors: {}, loading: false };
  }

  onSubmit = async () => {
    const { dispatch, linode } = this.props;

    await dispatch(dispatchOrStoreErrors.call(this, [
      () => takeBackup(linode.id),
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
