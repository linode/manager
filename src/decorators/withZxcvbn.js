import React from 'react';
import Loadable from 'react-loadable';

const withZxcvbn = (Component) => Loadable({
  loader: () => import('zxcvbn'),
  loading: () => null,
  render(loaded, props) {
    return React.createElement(Component, {
      ...props,
      calculatePasswordStrength: loaded,
    });
  },
});

export default withZxcvbn;
