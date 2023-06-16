import * as React from 'react';
import {
  matchPath,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import SMTPRestrictionText from 'src/features/Linodes/SMTPRestrictionText';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const LinodeSummary = React.lazy(() => import('./LinodeSummary/LinodeSummary'));
const LinodeNetworking = React.lazy(
  () => import('./LinodeNetworking/LinodeNetworking')
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage'));
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
    history.push(tabs[index].routeName);
  };

  let idx = 0;

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!linode) {
    return <CircleProgress />;
  }

  const index = getIndex();

  return (
    <>
      <DocumentTitleSegment
        segment={`${linode?.label} - ${
          tabs[getIndex()]?.title ?? 'Detail View'
        }`}
      />
      <SMTPRestrictionText supportLink={{ label: linode?.label, id }}>
        {({ text }) =>
          text !== null ? (
            <DismissibleBanner
              warning
              preferenceKey={`smtp-restriction-notice-${linode?.label}`}
              spacingTop={32}
            >
              <Grid xs={12}>{text}</Grid>
            </DismissibleBanner>
          ) : null
        }
      </SMTPRestrictionText>
      <div style={{ marginTop: 8 }}>
        <Tabs value={index} onChange={(_, i) => navToURL(i)}>
          {tabs.map((t) => (
            <Tab key={t.title} label={t.title} />
          ))}
        </Tabs>
        <React.Suspense fallback={<SuspenseLoader />}>
          <SafeTabPanel value={index} index={idx++}>
            <LinodeSummary
              isBareMetalInstance={isBareMetalInstance}
              linodeCreated={linode?.created}
            />
          </SafeTabPanel>
          <SafeTabPanel value={index} index={idx++}>
            <LinodeNetworking />
          </SafeTabPanel>
          {isBareMetalInstance ? null : (
            <>
              <SafeTabPanel value={index} index={idx++}>
                <LinodeStorage />
              </SafeTabPanel>
              <SafeTabPanel value={index} index={idx++}>
                <LinodeConfigurations />
              </SafeTabPanel>

              <SafeTabPanel value={index} index={idx++}>
                <LinodeBackup />
              </SafeTabPanel>
            </>
          )}
          <SafeTabPanel value={index} index={idx++}>
            <LinodeActivity />
          </SafeTabPanel>
          <SafeTabPanel value={index} index={idx++}>
            <LinodeSettings />
          </SafeTabPanel>
        </React.Suspense>
      </div>
    </>
  );
};

export default LinodesDetailNavigation;
