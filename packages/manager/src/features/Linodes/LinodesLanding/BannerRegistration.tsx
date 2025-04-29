import * as React from 'react';
import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { BannerContext } from 'src/MainContent';

interface BannerRegistrationProps {
  showMaintenance?: boolean;
}

export const BannerRegistration: React.FC<BannerRegistrationProps> = ({
  showMaintenance = false,
}) => {
  const { registerBanner, clearBanners } =
    React.useContext(BannerContext) ?? {};

  const didRegisterRef = React.useRef(false);

  React.useEffect(() => {
    if (!registerBanner) return;
    if (didRegisterRef.current) return; // ✅ only once

    didRegisterRef.current = true;

    const registered: React.ReactNode[] = [];

    if (showMaintenance) {
      const maintenanceBanner = <MaintenanceBanner />;
      registerBanner(maintenanceBanner);
      registered.push(maintenanceBanner);
    }

    const productInfoBanner = (
      <ProductInformationBanner bannerLocation="Linodes" />
    );
    registerBanner(productInfoBanner);
    registered.push(productInfoBanner);

    return () => {
      clearBanners?.(registered);
    };
  }, [registerBanner, clearBanners, showMaintenance]); // ✅ only these are dependencies

  return null;
};
