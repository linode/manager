import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router';


export default function Tabs(props) {
  const {
    className,
    children,
    isSubTabs,
    onClick,
    pathname,
    selectedIndex,
    tabs,
  } = props;

  let selected;
  if (selectedIndex !== undefined) {
    selected = selectedIndex;
  } else if (pathname) {
    selected = tabs.reduce(function (knownIndex, { link }, currentIndex) {
      return pathname.indexOf(link) === 0 ? currentIndex : knownIndex;
    }, 0);
  } else {
    selected = 0;
  }

  const componentName = isSubTabs ? 'SubTabs' : 'Tabs';
  return (
    <ReactTabs
      selectedIndex={selected}
      className={`${componentName} ${className}`}
    >
      <TabList className="TabList">
        {tabs.map(function (tab, i) {
          const className = ((i + 1) === selected) ? 'selected-previous' : '';
          return (
            <Tab
              key={tab.name}
              className={`Tab ${className}`}
              onClick={(e) => {
                if (onClick) {
                  onClick(e, i);
                }
              }}
            >
              {tab.link ? <Link to={tab.link}>{tab.name}</Link> : tab.name}
            </Tab>
          );
        })}
      </TabList>
      {tabs.map((tab) => {
        return (
          <TabPanel key={tab.name} className={`${componentName}-container`}>
            {tab.children || children}
          </TabPanel>
        );
      })}
    </ReactTabs>
  );
}

Tabs.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isSubTabs: PropTypes.bool,
  onClick: PropTypes.func,
  pathname: PropTypes.string,
  selectedIndex: PropTypes.number,
  tabs: PropTypes.array.isRequired,
};

Tabs.defaultProps = {
  className: '',
  isSubTabs: false,
};
