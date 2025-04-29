import * as React from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import {
  useAddBanner,
  useRemoveBanner,
  useClearBanners,
} from 'src/queries/banners';

interface LinodeDetailBannerNotificationsProps {
  linodeId: number;
  linodeStatus: string;
  matchedLinodeId: number;
}

export const LinodeDetailBannerNotifications = ({
  linodeId,
  linodeStatus,
  matchedLinodeId,
}: LinodeDetailBannerNotificationsProps) => {
  const addBanner = useAddBanner();
  const removeBanner = useRemoveBanner();
  const clearBanners = useClearBanners();
  const location = useLocation();

  const match = useRouteMatch<{ id: string }>('/linodes/:id');
  const isOnLinodeDetail = Boolean(match);

  React.useEffect(() => {
    // Always remove before re-registering
    removeBanner('linodeDetails');

    if (isOnLinodeDetail) {
      clearBanners();

      addBanner({
        id: 'linodeDetails-host-maintenance',
        component: 'HostMaintenance',
        props: { linodeStatus },
      });

      addBanner({
        id: 'linodeDetails-mutation-notification',
        component: 'MutationNotification',
        props: { linodeId: matchedLinodeId },
      });

      addBanner({
        id: 'linodeDetails-notifications',
        component: 'Notifications',
      });

      addBanner({
        id: 'linodeDetails-volumes-upgrade',
        component: 'VolumesUpgradeBanner',
        props: { linodeId },
      });

      addBanner({
        id: 'linodeDetails-product-info',
        component: 'ProductInformationBanner',
        props: { bannerLocation: 'Linodes' },
      });
    }

    return () => {
      // Cleanup all these registered banners on unmount/route change
      removeBanner('linodeDetails-host-maintenance');
      removeBanner('linodeDetails-mutation-notification');
      removeBanner('linodeDetails-notifications');
      removeBanner('linodeDetails-volumes-upgrade');
      removeBanner('linodeDetails-product-info');
      clearBanners();
    };
  }, [
    location.pathname,
    isOnLinodeDetail,
    linodeId,
    linodeStatus,
    matchedLinodeId,
    addBanner,
    removeBanner,
    clearBanners,
  ]);

  return null;
};
