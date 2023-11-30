  import * as React from 'react';
  
  import { TabPanels } from 'src/components/Tabs/TabPanels';
  import { Tabs } from 'src/components/Tabs/Tabs';
  import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
  import { TabLinkList } from 'src/components/Tabs/TabLinkList';
  import { GuestMetrics } from './TabsContent/Guest/GuestMetrics';
  
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
  
    return (
      <>
        <Tabs
          defaultIndex={defaultTabIndex()}
        >
            <TabLinkList tabs={tabs} />
              <TabPanels>
                  <SafeTabPanel index={0}>
                  <h3 style={{marginTop: "20%",marginLeft: "45%",marginBottom: "25%"}}>VM (Host) content here</h3>
                  </SafeTabPanel>
                  <SafeTabPanel index={1}>
                  {/* <h3 style={{marginTop: "5%",marginLeft: "45%",marginBottom: "5%"}}>VM (Guest) content here</h3> */}
                  <GuestMetrics></GuestMetrics>
                  </SafeTabPanel>
                  <SafeTabPanel index={2}>
                  <h3 style={{marginTop: "2%",marginLeft: "45%",marginBottom: "2%"}}>DBaaS content here</h3>
                  </SafeTabPanel>
              </TabPanels>
        </Tabs>
      </>
    );

  };
      
  export default React.memo(CloudViewTabs);
  