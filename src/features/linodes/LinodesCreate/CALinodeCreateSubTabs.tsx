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
  reset: () => void;
  tabs?: Tab[];
  type: 'oneClick' | 'myImages';
}

interface State {
  selectedTab: number;
}

type CombinedProps = Props;

export const determinePreselectedTab = (tabsToRender: Tab[]): number => {
  /** get the query params as an object, excluding the "?" */
  const queryParams = parse(location.search.replace('?', ''));

  /** will be -1 if the query param is not found */
  const preSelectedTab = tabsToRender.findIndex((eachTab, index) => {
    return eachTab.title === queryParams.subtype;
  });

  return preSelectedTab !== -1 ? preSelectedTab : 0;
};

class CALinodeCreateSubTabs extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    const tabsToRender = this.getTabsToRender(props.type, props.tabs);

    this.state = {
      selectedTab: determinePreselectedTab(tabsToRender)
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
        return <div>community stackscripts</div>;
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
    /** Reset the top-level creation flow state */
    this.props.reset();
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
    const { selectedTab: selectedTabFromState } = this.state;

    const tabsToRender = this.getTabsToRender(type, tabs);
    const queryParams = parse(location.search.replace('?', ''));

    /**
     * doing this check here to reset the sub-tab if the
     * query string doesn't exist to solve the issue where the user
     * clicks on tab 2, subtab 3 - THEN clicks on tab 1 which only has 2 subtabs.
     *
     * In this case, tab 1 has only 2 subtabs so, we need to reset the selected sub-tab
     * or else we get an error
     */
    const selectedTab = !queryParams.subtype ? 0 : selectedTabFromState;

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
