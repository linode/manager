import { PropTypes } from 'react';

import { clients } from '~/api';
import CreateApplication from './CreateApplication';

export default class EditApplication extends CreateApplication {
  constructor(props) {
    super(props);

    this.submitText = 'Save';

    const { label, redirect } = props;
    this.state = {
      errors: {},
      thumbnail: '',
      label,
      redirect,
    };
  }

  submitAction = async (label, redirect) => {
    const { id } = this.props;
    await this.props.dispatch(clients.put({ label, redirect_uri: redirect }, [id]));
    return { id };
  }
}

EditApplication.propTypes = {
  ...CreateApplication.propTypes,
  label: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
