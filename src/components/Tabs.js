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
    <li className={classes}>
      <Link to={to}>{name}</Link>
    </li>
  );
};

Tab.propTypes = {
  name: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
};

Tab.defaultProps = {
  selected: false,
  disabled: false,
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
};

export default TabsComponent;
