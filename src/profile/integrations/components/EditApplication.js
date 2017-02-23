import { PropTypes } from 'react';

import { clients } from '~/api';
import CreateApplication from './CreateApplication';

export default class EditApplication extends CreateApplication {
  constructor(props) {
    super(props);

    this.submitText = 'Save';

    const { name, redirect } = props;
    this.state = {
      errors: {},
      thumbnail: '',
      name,
      redirect,
    };
  }

  submitAction = async (name, redirect) => {
    const { id } = this.props;
    await this.props.dispatch(clients.put({ name, redirect_uri: redirect }, [id]));
    return { id };
  }
}

EditApplication.propTypes = {
  ...CreateApplication.propTypes,
  name: PropTypes.string.isRequired,
  redirect: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
