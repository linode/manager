import React from 'react';
import { Link, Route } from 'react-router-dom';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const NavigationLink = ({ linkClass, to, label, highlight, ...rest }) => {
  return (
    <Route
      path={to}
      children={(matchProps) => {
        const { match } = matchProps;
        return (
          <Link
            className={classnames({
              [linkClass]: true,
              [`${linkClass}--selected`]: match || highlight,
            })}
            to={to}
            {...rest}
          >
            {label}
          </Link>
        );
      }}
    />
  );
};

NavigationLink.propTypes = {
  linkClass: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  /**
   * {Boolean} [highlight] Used to force appending selection class to the Link.
   * !! This only applies when the path check is false.
   */
  highlight: PropTypes.bool,
};

export default NavigationLink;
