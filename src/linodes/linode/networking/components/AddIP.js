import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  Input,
  ModalFormGroup,
  Radio,
  SubmitButton,
} from 'linode-components/forms';

import { showModal, hideModal } from '~/actions/modal';
import { TrackEvent } from '~/actions/trackEvent.js';
import { addIP } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';
import { MONTHLY_IP_COST } from '~/constants';


export default class AddIP extends Component {
  static trigger(dispatch, linode) {
    return dispatch(showModal('Add an IP Address', (
      <AddIP
        dispatch={dispatch}
        linode={linode}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      type: 'public',
    };
  }

  onSubmit = () => {
    const { dispatch, linode, close } = this.props;
    const { type } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => addIP(linode.id, type),
      () => TrackEvent('Submit', 'add ip', 'linode'),
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { errors, loading, type } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <p>
          You will incur a ${MONTHLY_IP_COST}/month charge for each additional public IPv4.
          To request more IPv6 addresses, you'll have to <Link to="/support/create">create a
          ticket</Link>.
        </p>
        <ModalFormGroup label="Version">
          <Input disabled value="IPv4" />
        </ModalFormGroup>
        <ModalFormGroup label="Type" id="type" apiKey="type">
          <div>
            <Radio
              id="public"
              name="type"
              value="public"
              checked={type === 'public'}
              onChange={this.onChange}
              label="Public"
            />
          </div>
          <div>
            <Radio
              id="private"
              name="type"
              value="private"
              checked={type === 'private'}
              onChange={this.onChange}
              label="Private"
            />
          </div>
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={loading} disabledChildren="Adding">Add</SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

AddIP.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
