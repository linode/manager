// @ts-nocheck
import React from 'react';
import { useMediaQuery, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useDetailsLayoutBreakpoints } from '@linode/ui';

import {
  summaryData,
  vpcData,
  publicIpData,
  accessData,
  firewallData,
} from './detailsData';

import { detailActions } from './actionData';
import TwoColumnWithSidebarLayout from './layouts/TwoColumnWithSidebarLayout';
import ThreeColumnLayout from './layouts/ThreeColumnLayout';
import MenuActions from './MenuActions';
import TagsRow from './TagsRow';

export const NewDetailTemplateA = () => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop, menuIsCollapsed } =
    useDetailsLayoutBreakpoints();

  const isDesktop1030Up = useMediaQuery(theme.breakpoints.up('dl_desktop1030'));
  const isDesktop1214Up = useMediaQuery(theme.breakpoints.up('dl_desktop1214'));
  const isTablet950ToMd = useMediaQuery(
    theme.breakpoints.between('dl_tablet950', 'md')
  );

  const debugMode = true;

  const shouldUseLargeSpacing =
    (isDesktop1030Up && menuIsCollapsed) || isDesktop1214Up || isTablet950ToMd;
  const sectionMarginBottom = isMobile
    ? theme.spacingFunction(24)
    : theme.spacingFunction(16);

  const columnConfigs = [publicIpData, accessData, firewallData];

  const [tags, setTags] = React.useState(Array(11).fill('Tag label'));

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <h2 style={{ margin: 0 }}>ubuntu-us-southeast</h2>
        <MenuActions actions={detailActions} />
      </Box>

      <TwoColumnWithSidebarLayout
        isMobile={isMobile}
        menuIsCollapsed={menuIsCollapsed}
        shouldUseLargeSpacing={shouldUseLargeSpacing}
        sectionMarginBottom={sectionMarginBottom}
        mainSection={summaryData}
        sidebarSection={vpcData}
        debugMode={debugMode}
      />

      <ThreeColumnLayout
        columns={columnConfigs}
        menuIsCollapsed={menuIsCollapsed}
        shouldUseLargeSpacing={shouldUseLargeSpacing}
        sectionMarginBottom={sectionMarginBottom}
        debugMode={debugMode}
      />

      <TagsRow
        tags={tags}
        setTags={setTags}
        sectionMarginBottom={sectionMarginBottom}
      />
    </div>
  );
};

export default NewDetailTemplateA;
