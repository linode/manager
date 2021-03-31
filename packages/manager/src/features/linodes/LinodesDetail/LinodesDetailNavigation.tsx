import { Config, LinodeType } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import { withLinodeDetailContext } from './linodeDetailContext';
const LinodeSummary = React.lazy(() => import('./LinodeSummary/LinodeSummary'));
const LinodeNetworking = React.lazy(
  () => import('./LinodeNetworking/LinodeNetworking')
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage'));
const LinodeConfigurations = React.lazy(
  () => import('./LinodeAdvanced/LinodeAdvancedConfigurationsPanel')
);
const LinodeBackup = React.lazy(() => import('./LinodeBackup'));
const LinodeActivity = React.lazy(
  () => import('./LinodeActivity/LinodeActivity')
);
const LinodeSettings = React.lazy(
  () => import('./LinodeSettings/LinodeSettings')
);

type CombinedProps = ContextProps &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.FC<CombinedProps> = (props) => {
  const {
    linodeLabel,
    linodeType,
    match: { url },
  } = props;

  // Bare metal Linodes have a very different detail view
  const isBareMetalInstance = linodeType?.class === 'metal';

  const tabs = [
    {
      routeName: `${url}/analytics`,
      title: 'Analytics',
    },
    {
      routeName: `${url}/networking`,
      title: 'Network',
    },
    {
      routeName: `${url}/storage`,
      title: 'Storage',
      hidden: isBareMetalInstance,
    },
    {
      routeName: `${url}/configurations`,
      title: 'Configurations',
      hidden: isBareMetalInstance,
    },
    {
      routeName: `${url}/backup`,
      title: 'Backups',
      hidden: isBareMetalInstance,
    },
    {
      routeName: `${url}/activity`,
      title: 'Activity Feed',
    },
    {
      routeName: `${url}/settings`,
      title: 'Settings',
    },
  ].filter((thisTab) => !thisTab.hidden);

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const getIndex = () => {
    return Math.max(
      tabs.findIndex((tab) => matches(tab.routeName)),
      0
    );
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  let idx = 0;

  return (
    <>
      <DocumentTitleSegment
        segment={`${linodeLabel} - ${tabs[getIndex()]?.title ?? 'Detail View'}`}
      />
      <div style={{ marginTop: 8 }}>
        <Tabs index={getIndex()} onChange={navToURL}>
          <TabLinkList tabs={tabs} />

          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              <SafeTabPanel index={idx++}>
                <LinodeSummary />
              </SafeTabPanel>

              <SafeTabPanel index={idx++}>
                <LinodeNetworking />
              </SafeTabPanel>

              {isBareMetalInstance ? null : (
                <>
                  <SafeTabPanel index={idx++}>
                    <LinodeStorage />
                  </SafeTabPanel>
                  <SafeTabPanel index={idx++}>
                    <LinodeConfigurations />
                  </SafeTabPanel>

                  <SafeTabPanel index={idx++}>
                    <LinodeBackup />
                  </SafeTabPanel>
                </>
              )}

              <SafeTabPanel index={idx++}>
                <LinodeActivity />
              </SafeTabPanel>

              <SafeTabPanel index={idx++}>
                <LinodeSettings isBareMetalInstance={isBareMetalInstance} />
              </SafeTabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </div>
    </>
  );
};

interface ContextProps {
  linodeId: number;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeRegion: string;
  linodeType?: LinodeType | null | undefined;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, {}>(
  withRouter,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeId: linode.id,
    linodeConfigs: linode._configs,
    linodeLabel: linode.label,
    linodeRegion: linode.region,
    linodeType: linode._type,
    readOnly: linode._permissions === 'read_only',
  }))
);

export default enhanced(LinodesDetailNavigation);
