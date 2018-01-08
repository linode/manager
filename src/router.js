import { RouterContext, match } from 'react-router';
import { checkLogin } from './session';


// This wraps the react-router match function so that we can await it
// and replace it easily in tests.
function matchPromise(_ref, callback) {
  return new Promise(resolve => {
    match(_ref, (...args) => {
      callback(...args, resolve);
    });
  });
}

export class LoadingRouterContext extends RouterContext {
  constructor(props) {
    super(props);
    this.match = props.match;

    this.state = { checkLoginDone: false };
  }

  async componentWillMount() {
    const ret = checkLogin(this.props);
    if (ret) {
      return;
    }

    // We are not going to redirect, so session is fine so far. Show AppLoader.
    this.setState({ checkLoginDone: true });
  }

  async componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    // Force scroll to the top of the page on page change. ONLY AFTER PRELOAD
    window.scroll(0, 0);
  }

  render() {
    if (!this.state.checkLoginDone) {
      return null;
    }

    return super.render();
  }
}

LoadingRouterContext.defaultProps = {
  match: matchPromise,
};
