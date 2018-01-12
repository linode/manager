import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Tab = ({ name, to, selected, disabled, parentClass }) => {
  const classes = classnames({
    [`${parentClass}__tab`]: true,
    [`${parentClass}__tab--selected`]: selected,
    [`${parentClass}__tab--disabled`]: disabled,
  });

  return (
    <Link to={to}>
      <li className={classes}>
        {name}
      </li>
    </Link>
  );
};

Tab.propTypes = {
  name: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  parentClass: PropTypes.string,
};

Tab.defaultProps = {
  selected: false,
  disabled: false,
  parentClass: 'linode-tabs',
};

const TabsComponent = ({ tabs, parentClass = 'linode-tabs' }) => {
  return (
    <div className={`${parentClass}__container`}>
      <ul className={`${parentClass}__tab-list`}>
        {tabs.map((props, key) => React.createElement(Tab, { ...props, key, parentClass }))}
      </ul>
    </div>
  );
};

TabsComponent.propTypes = {
  tabs: PropTypes.array.isRequired,
  parentClass: PropTypes.string,
};

TabsComponent.defaultProps = {
  parentClass: 'linode-tabs',
};

export default TabsComponent;
