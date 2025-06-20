import {
  useLinodeQuery,
  usePreferences,
  useRegionsQuery,
  useTypeQuery,
} from '@linode/queries';
import { BetaChip, CircleProgress, ErrorState } from '@linode/ui';
import { isAclpSupportedRegion } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { SMTPRestrictionText } from 'src/features/Linodes/SMTPRestrictionText';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

const LinodeMetrics = React.lazy(() => import('./LinodeMetrics/LinodeMetrics'));
const LinodeNetworking = React.lazy(() =>
  import('./LinodeNetworking/LinodeNetworking').then((module) => ({
    default: module.LinodeNetworking,
  }))
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage/LinodeStorage'));
const LinodeConfigurations = React.lazy(
  () => import('./LinodeConfigs/LinodeConfigs')
);
const LinodeBackup = React.lazy(() => import('./LinodeBackup/LinodeBackups'));
const LinodeActivity = React.lazy(
  () => import('./LinodeActivity/LinodeActivity')
);
const LinodeAlerts = React.lazy(() => import('./LinodeAlerts/LinodeAlerts'));
const LinodeSettings = React.lazy(
  () => import('./LinodeSettings/LinodeSettings')
);

const LinodesDetailNavigation = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);
  const { data: linode, error } = useLinodeQuery(id);
  const { aclpBetaServices } = useFlags();
  const { data: aclpPreferences } = usePreferences((preferences) => ({
    isAclpMetricsPreferenceBeta: preferences?.isAclpMetricsBeta,
    isAclpAlertsPreferenceBeta: preferences?.isAclpAlertsBeta,
  }));

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  // Bare metal Linodes have a very different detail view
  const isBareMetalInstance = type?.class === 'metal';

  const { data: regions } = useRegionsQuery();

  const isAclpMetricsSupportedRegionLinode = isAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    regions,
    type: 'metrics',
  });

  const isAclpAlertsSupportedRegionLinode = isAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    regions,
    type: 'alerts',
  });

  const { tabs, handleTabChange, tabIndex, getTabIndex } = useTabs([
    {
      chip:
        aclpBetaServices?.linode?.metrics &&
        isAclpMetricsSupportedRegionLinode &&
        aclpPreferences?.isAclpMetricsPreferenceBeta ? (
          <BetaChip />
        ) : null,
      to: '/linodes/$linodeId/metrics',
      title: 'Metrics',
    },
    {
      to: '/linodes/$linodeId/networking',
      title: 'Network',
    },
    {
      hide: isBareMetalInstance,
      to: '/linodes/$linodeId/storage',
      title: 'Storage',
    },
    {
      hide: isBareMetalInstance,
      to: '/linodes/$linodeId/configurations',
      title: 'Configurations',
    },
    {
      hide: isBareMetalInstance,
      to: '/linodes/$linodeId/backup',
      title: 'Backups',
    },
    {
      to: '/linodes/$linodeId/activity',
      title: 'Activity Feed',
    },
    {
      chip:
        aclpBetaServices?.linode?.alerts &&
        isAclpAlertsSupportedRegionLinode &&
        aclpPreferences?.isAclpAlertsPreferenceBeta ? (
          <BetaChip />
        ) : null,
      to: '/linodes/$linodeId/alerts',
      title: 'Alerts',
    },
    {
      to: '/linodes/$linodeId/settings',
      title: 'Settings',
    },
  ]);

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!linode) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment
        // TODO: Tanstack Router - Add the tab title here somehow
        // segment={`${linode?.label} - ${
        //   tabs[getIndex()]?.title ?? 'Detail View'
        // }`}
        segment={`${linode?.label} - Detail View`}
      />
      <SMTPRestrictionText
        linode={linode}
        supportLink={{ id, label: linode?.label }}
      >
        {({ text }) =>
          text !== null ? (
            <DismissibleBanner
              preferenceKey={`smtp-restriction-notice-${linode?.label}`}
              spacingTop={32}
              variant="warning"
            >
              <Grid size={12}>{text}</Grid>
            </DismissibleBanner>
          ) : null
        }
      </SMTPRestrictionText>
      <div style={{ marginTop: 8 }}>
        <Tabs index={tabIndex} onChange={handleTabChange}>
          <TanStackTabLinkList tabs={tabs} />
          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              <SafeTabPanel index={getTabIndex('/linodes/$linodeId/metrics')}>
                <LinodeMetrics
                  isAclpMetricsSupportedRegionLinode={
                    isAclpMetricsSupportedRegionLinode
                  }
                  linodeCreated={linode?.created}
                  linodeId={id}
                />
              </SafeTabPanel>
              <SafeTabPanel
                index={getTabIndex('/linodes/$linodeId/networking')}
              >
                <LinodeNetworking />
              </SafeTabPanel>
              {isBareMetalInstance ? null : (
                <>
                  <SafeTabPanel
                    index={getTabIndex('/linodes/$linodeId/storage')}
                  >
                    <LinodeStorage />
                  </SafeTabPanel>
                  <SafeTabPanel
                    index={getTabIndex('/linodes/$linodeId/configurations')}
                  >
                    <LinodeConfigurations />
                  </SafeTabPanel>

                  <SafeTabPanel
                    index={getTabIndex('/linodes/$linodeId/backup')}
                  >
                    <LinodeBackup />
                  </SafeTabPanel>
                </>
              )}
              <SafeTabPanel index={getTabIndex('/linodes/$linodeId/activity')}>
                <LinodeActivity />
              </SafeTabPanel>
              <SafeTabPanel index={getTabIndex('/linodes/$linodeId/alerts')}>
                <LinodeAlerts
                  isAclpAlertsSupportedRegionLinode={
                    isAclpAlertsSupportedRegionLinode
                  }
                />
              </SafeTabPanel>
              <SafeTabPanel index={getTabIndex('/linodes/$linodeId/settings')}>
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
