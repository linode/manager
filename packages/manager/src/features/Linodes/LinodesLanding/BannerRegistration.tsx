import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  useAddBanner,
  useRemoveBanner,
  useClearBanners,
} from '../../../queries/banners';

interface BannerRegistrationProps {
  showMaintenance?: boolean;
}

export const BannerRegistration = ({
  showMaintenance = false,
}: BannerRegistrationProps) => {
  const addBanner = useAddBanner();
  const removeBanner = useRemoveBanner();
  const clearBanners = useClearBanners();
  const location = useLocation();

  React.useEffect(() => {
    const isOnLinodes = location.pathname.startsWith('/linodes');

    if (isOnLinodes) {
      // Clear all previous banners before adding new ones
      clearBanners();

      if (showMaintenance) {
        addBanner({
          id: 'maintenance',
          component: 'MaintenanceBanner',
        });
      }

      addBanner({
        id: 'linodesProductInfo',
        component: 'ProductInformationBanner',
        props: { bannerLocation: 'Linodes' },
      });
    } else {
      // Remove specific banners when leaving the route
      removeBanner('maintenance');
      removeBanner('linodesProductInfo');
    }
  }, [
    location.pathname,
    showMaintenance,
    addBanner,
    removeBanner,
    clearBanners,
  ]);

  return null;
};
