// @ts-nocheck
import React from 'react';
import { useMediaQuery } from '@mui/material';
import { useDetailsLayoutBreakpoints } from '@linode/ui';
import { useTheme } from '@mui/material/styles';

import {
  summaryData,
  vpcData,
  publicIpData,
  accessData,
  firewallData,
} from './detailsData';

import TwoColumnWithSidebarLayout from './layouts/TwoColumnWithSidebarLayout';
import ThreeColumnLayout from './layouts/ThreeColumnLayout';

export const NewDetailTemplateA = () => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop, menuIsCollapsed } =
    useDetailsLayoutBreakpoints();

  const isDesktop1030Up = useMediaQuery(theme.breakpoints.up('dl_desktop1030'));
  const isDesktop1214Up = useMediaQuery(theme.breakpoints.up('dl_desktop1214'));
  const isTablet950ToMd = useMediaQuery(
    theme.breakpoints.between('dl_tablet950', 'md')
  );

  const shouldUseLargeSpacing =
    (isDesktop1030Up && menuIsCollapsed) || isDesktop1214Up || isTablet950ToMd;
  const sectionMarginBottom = isMobile
    ? theme.spacingFunction(24)
    : theme.spacingFunction(16);

  const columnConfigs = [publicIpData, accessData, firewallData];

  return (
    <div
      style={{
        width: '100%',
        padding: 25,
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'white',
      }}
    >
      <h2>ubuntu-us-southeast</h2>

      <TwoColumnWithSidebarLayout
        isMobile={isMobile}
        menuIsCollapsed={menuIsCollapsed}
        shouldUseLargeSpacing={shouldUseLargeSpacing}
        sectionMarginBottom={sectionMarginBottom}
        mainSection={summaryData}
        sidebarSection={vpcData}
      />

      <ThreeColumnLayout
        columns={columnConfigs}
        menuIsCollapsed={menuIsCollapsed}
        shouldUseLargeSpacing={shouldUseLargeSpacing}
        sectionMarginBottom={sectionMarginBottom}
      />
    </div>
  );
};

export default NewDetailTemplateA;
