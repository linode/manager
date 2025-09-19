import { useLinodeQuery, usePreferences, useTypeQuery } from '@linode/queries';
import { useIsLinodeAclpSubscribed } from '@linode/shared';
import { BetaChip, CircleProgress, ErrorState } from '@linode/ui';
import Grid from '@mui/material/Grid';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { SMTPRestrictionText } from 'src/features/Linodes/SMTPRestrictionText';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { LinodesDetailContext } from './LinodesDetailContext';

const LinodesDetailNavigation = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const location = useLocation();
  const navigate = useNavigate();
  const id = Number(linodeId);
  const { data: linode, error } = useLinodeQuery(id);
  const { aclpServices } = useFlags();

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  // Bare metal Linodes have a very different detail view
  const isBareMetalInstance = type?.class === 'metal';

  const isAclpMetricsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'metrics',
  });

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'alerts',
  });
  const { data: isAclpMetricsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );

  // In Edit flow, default alert mode is based on Linode's ACLP subscription status
  const isLinodeAclpSubscribed = useIsLinodeAclpSubscribed(linode?.id, 'beta');
  const [isAclpAlertsBetaEditFlow, setIsAclpAlertsBetaEditFlow] =
    React.useState<boolean>(isLinodeAclpSubscribed);

  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      chip:
        aclpServices?.linode?.metrics?.enabled &&
        aclpServices?.linode?.metrics?.beta &&
        isAclpMetricsSupportedRegionLinode &&
        isAclpMetricsPreferenceBeta ? (
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
        aclpServices?.linode?.alerts?.enabled &&
        aclpServices?.linode?.alerts?.beta &&
        isAclpAlertsSupportedRegionLinode &&
        isAclpAlertsBetaEditFlow ? (
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

  if (location.pathname === `/linodes/${linodeId}`) {
    navigate({
      to: '/linodes/$linodeId/metrics',
      params: { linodeId },
      replace: true,
    });
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!linode) {
    return <CircleProgress />;
  }

  return (
    <LinodesDetailContext.Provider
      value={{
        isBareMetalInstance,
        isAlertsBetaMode: {
          get: isAclpAlertsBetaEditFlow,
          set: setIsAclpAlertsBetaEditFlow,
        },
      }}
    >
      <DocumentTitleSegment
        segment={`${linode?.label} - ${tabs[tabIndex]?.title} - Detail View`}
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
              <Outlet />
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </div>
    </LinodesDetailContext.Provider>
  );
};

export default LinodesDetailNavigation;
