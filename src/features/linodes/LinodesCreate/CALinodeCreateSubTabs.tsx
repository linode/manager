import { parse } from 'querystring';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import MUITab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Grid from 'src/components/Grid';

export interface Tab {
  title: string;
  render: () => JSX.Element;
}

interface Props {
  history: any;
  tabs?: Tab[];
  type: 'oneClick' | 'myImages';
}

interface State {
  selectedTab: number;
}

type CombinedProps = Props;

class CALinodeCreateSubTabs extends React.PureComponent<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    const tabsToRender = this.getTabsToRender(props.type, props.tabs);

    /** get the query params as an object, excluding the "?" */
    const queryParams = parse(location.search.replace('?', ''));

    /** will be -1 if the query param is not found */
    const preSelectedTab = tabsToRender.findIndex((eachTab, index) => {
      return eachTab.title === queryParams.subtype;
    });

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0
    };
  }

  oneClickTabs: Tab[] = [
    {
      title: 'One-Click Apps',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'Community StackScripts',
      render: () => {
        return <React.Fragment />;
      }
    }
  ];

  getTabsToRender = (type: string, tabs?: Tab[]) => {
    if (tabs) {
      return tabs;
    }
    return type === 'oneClick' ? this.oneClickTabs : [];
  };

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    /** get the query params as an object, excluding the "?" */
    const queryParams = parse(location.search.replace('?', ''));

    this.props.history.push({
      search: `?type=${queryParams.type}&subtype=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  render() {
    const { type, tabs } = this.props;
    const { selectedTab } = this.state;

    const tabsToRender = this.getTabsToRender(type, tabs);
    const selectedTabContentRender = tabsToRender[selectedTab].render;

    return (
      <Grid container>
        <Grid item className={`mlMain`}>
          <AppBar position="static" color="default">
            <Tabs
              value={selectedTab}
              onChange={this.handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              {tabsToRender.map((tab, idx) => (
                <MUITab
                  key={idx}
                  label={tab.title}
                  data-qa-create-from={tab.title}
                />
              ))}
            </Tabs>
          </AppBar>
        </Grid>
        {selectedTabContentRender()}
      </Grid>
    );
  }
}

export default CALinodeCreateSubTabs;
