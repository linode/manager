import React from 'react';
import Loadable from 'react-loadable';
import isEmpty from 'lodash/isEmpty';

export default (Component) => Loadable({
  loader: () => import('zxcvbn'),
  loading: () => null,
  render(loaded, props) {
    return React.createElement(Component, {
      ...props,
      passwordStrengthCalculator: (v) => isEmpty(v)
        ? null
        : loaded(v).score,
    });
  },
});
