import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Tab = ({ name, to, selected, disabled }) => {
  const classes = classnames({
    'linode-tabs__tab': true,
    'linode-tabs__tab--selected': selected,
    'linode-tabs__tab--disabled': disabled,
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


const TabsComponent = ({ tabs }) => {
  return (
    <div className="linode-tabs__container">
      <ul className="linode-tabs__tab-list">
        {tabs.map((props, key) => React.createElement(Tab, { ...props, key }))}
      </ul>
    </div>
  );
};

TabsComponent.propTypes = {
  tabs: PropTypes.array.isRequired,
};

export default TabsComponent;
