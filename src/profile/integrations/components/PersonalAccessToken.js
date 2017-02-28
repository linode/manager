import AuthorizedApplication from './AuthorizedApplication';

export default class PersonalAccessToken extends AuthorizedApplication {
  constructor(props) {
    super(props);

    const { label, scopes, dispatch } = props;
    this.state = {
      label,
      scopes,
      dispatch,
    };
  }
}
