import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import { withLinodeDetailContext } from './linodeDetailContext';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
const LinodeSummary_CMR = React.lazy(() =>
  import('./LinodeSummary/LinodeSummary_CMR')
);
const LinodeNetworking_CMR = React.lazy(() =>
  import('./LinodeNetworking/LinodeNetworking_CMR')
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage'));
const LinodeAdvanced_CMR = React.lazy(() =>
  import('./LinodeAdvanced/LinodeAdvancedConfigurationsPanel_CMR')
);
const LinodeBackup_CMR = React.lazy(() =>
  import('./LinodeBackup/LinodeBackup_CMR')
);
const LinodeActivity_CMR = React.lazy(() =>
  import('./LinodeActivity/LinodeActivity_CMR')
);
const LinodeSettings_CMR = React.lazy(() =>
  import('./LinodeSettings/LinodeSettings_CMR')
);

type CombinedProps = ContextProps &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.FC<CombinedProps> = props => {
  const {
    linodeLabel,
    match: { url }
  } = props;

  const tabs = [
    {
      routeName: `${url}/analytics`,
      title: 'Analytics'
    },
    {
      routeName: `${url}/networking`,
      title: 'Network'
    },
    // Previously Volumes
    {
      routeName: `${url}/storage`,
      title: 'Storage'
    },
    // Previously Disks/Configs
    {
      routeName: `${url}/configurations`,
      title: 'Configurations'
    },
    {
      routeName: `${url}/backup`,
      title: 'Backups'
    },
    {
      routeName: `${url}/activity`,
      title: 'Activity Feed'
    },
    {
      routeName: `${url}/settings`,
      title: 'Settings'
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const getIndex = () => {
    return Math.max(
      tabs.findIndex(tab => matches(tab.routeName)),
      0
    );
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <>
      <DocumentTitleSegment
        segment={`${linodeLabel} - ${tabs[getIndex()]?.title ?? 'Detail View'}`}
      />
      <Tabs index={getIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <LinodeSummary_CMR />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <LinodeNetworking_CMR />
            </SafeTabPanel>

            <SafeTabPanel index={2}>
              <LinodeStorage />
            </SafeTabPanel>

            <SafeTabPanel index={3}>
              <LinodeAdvanced_CMR />
            </SafeTabPanel>

            <SafeTabPanel index={4}>
              <LinodeBackup_CMR />
            </SafeTabPanel>

            <SafeTabPanel index={5}>
              <LinodeActivity_CMR />
            </SafeTabPanel>

            <SafeTabPanel index={6}>
              <LinodeSettings_CMR />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

interface ContextProps {
  linodeId: number;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeRegion: string;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, {}>(
  withRouter,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeId: linode.id,
    linodeConfigs: linode._configs,
    linodeLabel: linode.label,
    linodeRegion: linode.region,
    readOnly: linode._permissions === 'read_only'
  }))
);

export default enhanced(LinodesDetailNavigation);
