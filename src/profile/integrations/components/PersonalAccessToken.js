import AuthorizedApplication from './AuthorizedApplication';

export default class PersonalAccessToken extends AuthorizedApplication {
  constructor(props) {
    super(props);

    const { type, label, scopes, dispatch } = props;
    this.state = {
      type,
      label,
      scopes,
      dispatch,
    };
  }
}
