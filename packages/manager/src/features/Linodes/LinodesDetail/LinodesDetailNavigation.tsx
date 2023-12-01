import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import {
  matchPath,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { SMTPRestrictionText } from 'src/features/Linodes/SMTPRestrictionText';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';

const LinodeSummary = React.lazy(() => import('./LinodeSummary/LinodeSummary'));
const LinodeNetwork = React.lazy(
  () => import('./LinodeNetworking/LinodeNetwork')
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage/LinodeStorage'));
const LinodeConfigurations = React.lazy(
  () => import('./LinodeConfigs/LinodeConfigs')
);
const LinodeBackup = React.lazy(() => import('./LinodeBackup/LinodeBackups'));
const LinodeActivity = React.lazy(
  () => import('./LinodeActivity/LinodeActivity')
);
const LinodeSettings = React.lazy(
  () => import('./LinodeSettings/LinodeSettings')
);

const LinodesDetailNavigation = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const { data: linode, error } = useLinodeQuery(id);
  const { url } = useRouteMatch();
  const history = useHistory();

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  // Bare metal Linodes have a very different detail view
  const isBareMetalInstance = type?.class === 'metal';

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
      hidden: isBareMetalInstance,
      routeName: `${url}/storage`,
      title: 'Storage',
    },
    {
      hidden: isBareMetalInstance,
      routeName: `${url}/configurations`,
      title: 'Configurations',
    },
    {
      hidden: isBareMetalInstance,
      routeName: `${url}/backup`,
      title: 'Backups',
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
    history.push(tabs[index].routeName);
  };

  let idx = 0;

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!linode) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment
        segment={`${linode?.label} - ${
          tabs[getIndex()]?.title ?? 'Detail View'
        }`}
      />
      <SMTPRestrictionText supportLink={{ id, label: linode?.label }}>
        {({ text }) =>
          text !== null ? (
            <DismissibleBanner
              preferenceKey={`smtp-restriction-notice-${linode?.label}`}
              spacingTop={32}
              variant="warning"
            >
              <Grid xs={12}>{text}</Grid>
            </DismissibleBanner>
          ) : null
        }
      </SMTPRestrictionText>
      <div style={{ marginTop: 8 }}>
        <Tabs index={getIndex()} onChange={navToURL}>
          <TabLinkList tabs={tabs} />
          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              <SafeTabPanel index={idx++}>
                <LinodeSummary
                  isBareMetalInstance={isBareMetalInstance}
                  linodeCreated={linode?.created}
                />
              </SafeTabPanel>
              <SafeTabPanel index={idx++}>
                <LinodeNetwork />
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
                <LinodeSettings />
              </SafeTabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </div>
    </>
  );
};

export default LinodesDetailNavigation;
