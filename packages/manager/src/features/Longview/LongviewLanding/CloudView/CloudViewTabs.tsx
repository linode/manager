  import * as React from 'react';
  // import { matchPath } from 'react-router-dom';
  
  import { TabPanels } from 'src/components/ReachTabPanels';
  import { Tabs } from 'src/components/ReachTabs';
  import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
  import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
  
  export const CloudViewTabs = (props: any) => {
    const tabs = [
      {
        routeName: `${props.match.url}/cloudview?usecase=host`,
        title: 'VM (Host)',
      },
      {
        routeName: `${props.match.url}/cloudview?usecase=guest`,
        title: 'VM (Guest)',
      },
      {
        routeName: `${props.match.url}/cloudview?usecase=dbaas`,
        title: 'DBaaS',
      }
    ];

    const defaultTabIndex = () => {
      const browserRoute = window.location.pathname + window.location.search;
      return Math.max(
          tabs.findIndex((tab) => tab.routeName == browserRoute),
          0
        )
    }

    // const matches = (p: string) => {
    //   return Boolean(matchPath(p, { path: props.location.pathname }));
    // };
  
    // const navToURL = (index: number) => {
    //   props.history.push(tabs[index].routeName);
    // };
  
    return (
      <>
        <Tabs
          defaultIndex={defaultTabIndex()}
          
          // index={Math.max(
          //   tabs.findIndex((tab) => matches(tab.routeName)),
          //   0
          // )}
          // onChange={navToURL}
          // style={{ marginTop: 0 }}

        >
            <TabLinkList tabs={tabs} />
              <TabPanels>
                  <SafeTabPanel index={0}>
                  <h3>test tab 1</h3>
                  </SafeTabPanel>
                  <SafeTabPanel index={1}>
                  <h3>test tab 2</h3>
                  </SafeTabPanel>
                  <SafeTabPanel index={2}>
                  <h3>test tab 3</h3>
                  </SafeTabPanel>
              </TabPanels>
        </Tabs>
      </>
    );

  };
      
  export default React.memo(CloudViewTabs);
  