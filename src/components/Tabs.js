import React, { PropTypes } from 'react';
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router';


export default function Tabs(props) {
  const { tabs, selected, className, children, onClick, isSubTabs } = props;

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
  tabs: PropTypes.array.isRequired,
  selected: PropTypes.number.isRequired,
  children: PropTypes.node,
  isSubTabs: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Tabs.defaultProps = {
  className: '',
  isSubTabs: false,
};
