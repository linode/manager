import React, { PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link } from 'react-router';


class NoOpClickTabs extends Tabs {
  constructor(props) {
    super(props);

    // By default, when a tab is clicked, the body of the control changes to
    // blank before anything's actually been loaded to replace it. This just
    // prevents that.
    this.handleClick = () => {};
  }
}

export default function LinodeTabs(props) {
  const { tabs, selected, className, onClick, tabClickNoOp } = props;

  const tabList = (
    <TabList>
      {tabs.map(tab => (
        <Tab
          key={tab.name}
          onClick={() => {
            if (onClick) {
              onClick(tab);
            }
          }}
        >
          {tab.link ? <Link to={tab.link}>{tab.name}</Link> : tab.name}
        </Tab>
      ))}
    </TabList>
  );

  const tabPanels = tabs.map(tab => (
    <TabPanel key={tab.name}>
      {tab === selected ? props.children : null}
    </TabPanel>
  ));

  if (tabClickNoOp) {
    return (
      <NoOpClickTabs selectedIndex={tabs.indexOf(selected)} className={`${className}`}>
        {tabList}
        {tabPanels}
      </NoOpClickTabs>
    );
  }

  return (
    <Tabs selectedIndex={tabs.indexOf(selected)} className={`${className}`}>
      {tabList}
      {tabPanels}
    </Tabs>
  );
}

LinodeTabs.propTypes = {
  tabs: PropTypes.array.isRequired,
  selected: PropTypes.object.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  tabClickNoOp: PropTypes.bool,
};

LinodeTabs.defaultProps = {
  className: '',
  tabClickNoOp: false,
};
