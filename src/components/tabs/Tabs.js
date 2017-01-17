import React, { PropTypes } from 'react';
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router';


export default function Tabs(props) {
  const { tabs, selected, className, children, onClick } = props;

  return (
    <ReactTabs
      selectedIndex={tabs.indexOf(selected)}
      className={`Tabs ${className}`}
    >
      <TabList>
        {tabs.map(tab => (
          <Tab
            key={tab.name}
            onClick={(e) => {
              if (onClick) {
                onClick(e, tab);
              }
            }}
          >
            {tab.link ? <Link to={tab.link}>{tab.name}</Link> : tab.name}
          </Tab>
        ))}
      </TabList>
      {tabs.map(tab => (
        <TabPanel key={tab.name}>
          {tab === selected ? children : null}
        </TabPanel>
      ))}
    </ReactTabs>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Tabs.defaultProps = {
  className: '',
};
