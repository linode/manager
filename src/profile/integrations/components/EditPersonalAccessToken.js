import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  Input,
  ModalFormGroup,
  SubmitButton,
} from 'linode-components/forms';

import { tokens } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { EmitEvent } from 'linode-components/utils';


export default class EditPersonalAccessToken extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      label: props.label,
      loading: false,
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { dispatch, id, title, close } = this.props;
    const { label } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => tokens.put({ label }, id),
      () => { EmitEvent('modal:submit', 'Modal', 'edit', title); },
      close,
    ]));
  }

  render() {
    const { close, title } = this.props;
    const { errors, label, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
          <Input
            name="label"
            id="label"
            placeholder="My token"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              close();
            }}
          />
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditPersonalAccessToken.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};
