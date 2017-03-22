import React, { PropTypes } from 'react';
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

  let searchPath;
  let selected;
  if (selectedIndex !== undefined) {
    searchPath = tabs[selectedIndex].link;
  } else if (pathname) {
    searchPath = pathname;
  }

  if (searchPath) {
    selected = tabs.reduce(function (knownIndex, { link }, currentIndex) {
      return searchPath.indexOf(link) === 0 ? currentIndex : knownIndex;
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
      <TabList>
        {tabs.map((tab, i) => (
          <Tab
            key={tab.name}
            onClick={(e) => {
              if (onClick) {
                onClick(e, i);
              }
            }}
          >
            {tab.link ? <Link to={tab.link}>{tab.name}</Link> : tab.name}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab, i) => (
        <TabPanel key={tab.name} className={`${componentName}-container`}>
          {i === selected ? tab.children || children : null}
        </TabPanel>
      ))}
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
