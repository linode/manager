// @ts-nocheck
import React from 'react';
import { Grid, Box, useMediaQuery } from '@mui/material';
import { useDetailsLayoutBreakpoints } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';

import {
  gridItems,
  sidebarItems,
  publicIpItems,
  accessItems,
  firewallItems,
  distributeItems,
  distributeItemsSequentially,
  DataItemType,
} from './detailsData';

// Sets colored backgrounds to help visualize the layout
const debugMode = true;

const DataItemWrapper = styled('div', { label: 'DataItemWrapper' })(
  ({ theme, backgroundColor }) => ({
    backgroundColor: debugMode ? backgroundColor : 'white',
    minWidth: 120,
    display: 'flex',
    flexDirection: 'column',
  })
);

export const DataItemLabel = styled('div', {
  label: 'DataItemLabel',
})(({ theme }) => ({
  fontSize: 14,
  color: theme.textColors.tableStatic,
  marginBottom: 4,
  fontWeight: theme.font.bold,
}));

const DataItemValue = styled('div', { label: 'DataItemValue' })(
  ({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.textColors.headlineStatic,
  })
);

export const SectionTitleWrapper = styled('div', { label: 'SectionTitle' })(
  ({ theme }) => ({
    backgroundColor: theme.tokens.alias.Interaction.Background.Secondary,
    color: theme.textColors.headlineStatic,
    padding: '2px 0',
    borderRadius: '8px 8px 0 0',
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 10,
  })
);

interface DataItemProps {
  label: string;
  value: string;
  color?: string;
  backgroundColor?: string;
}

const DataItem = ({ label, value, color, backgroundColor }: DataItemProps) => (
  <DataItemWrapper backgroundColor={backgroundColor}>
    <DataItemLabel color={color}>{label}</DataItemLabel>
    <DataItemValue color={color}>{value}</DataItemValue>
  </DataItemWrapper>
);

interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return <SectionTitleWrapper>{title}</SectionTitleWrapper>;
};

export const NewDetailTemplateA = () => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop, menuIsCollapsed } =
    useDetailsLayoutBreakpoints();

  let columns = 1;
  if (isDesktop) columns = 3;
  else if (isTablet) columns = 2;

  const isDesktop1030Up = useMediaQuery(theme.breakpoints.up('dl_desktop1030'));
  const isDesktop1214Up = useMediaQuery(theme.breakpoints.up('dl_desktop1214'));
  const isTablet950ToMd = useMediaQuery(
    theme.breakpoints.between('dl_tablet950', 'md')
  );
  const isDlFullSmall = useMediaQuery(theme.breakpoints.only('dl_fullSmall'));
  const isDlTabletSmall = useMediaQuery(
    theme.breakpoints.only('dl_tabletSmall')
  );

  const cond1 = (isDesktop1030Up && menuIsCollapsed) || isDesktop1214Up;
  const cond2 = isTablet950ToMd;

  const shouldUseLargeSpacing = cond1 || cond2;

  const shouldUseGap4 = isDlFullSmall || isDlTabletSmall;
  const sectionMarginBottom = isMobile
    ? theme.spacingFunction(24)
    : theme.spacingFunction(16);

  const reverseGridItems = gridItems.map((item) => ({ ...item }));
  const reverseSidebarItems = sidebarItems.map((item) => ({ ...item }));

  const distributedReverseGridItems = distributeItemsSequentially(
    reverseGridItems,
    2
  );

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
      <Grid
        container
        id="top-level-container"
        columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}
        sx={{ margin: 0 }}
      >
        <Grid
          size={{
            xs: 12,
            dl_tablet950: 8,
            sm: 12,
            md: 12,
            dl_desktop1030: menuIsCollapsed ? 8 : 12,
            dl_desktop1214: 8,
          }}
          id="red-section"
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="SUMMARY" />
          <Grid
            container
            columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}
            rowSpacing={isMobile ? 1.75 : 0}
          >
            {distributedReverseGridItems.map((columnItems, colIndex) => (
              <Grid
                key={colIndex}
                size={{
                  xs: 12,
                  dl_tablet950: 6,
                  sm: 6,
                  md: 6,
                  dl_desktop1030: 6,
                  dl_desktop1214: 6,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 1.75,
                  }}
                >
                  {columnItems.map((item, idx) => (
                    <DataItem
                      key={`reverse-grid-${colIndex}-${idx}`}
                      label={item.label}
                      value={item.value}
                      backgroundColor="#ffd7d7"
                    />
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid
          size={{
            xs: 12,
            dl_tablet950: 4,
            sm: 12,
            md: 12,
            dl_desktop1030: menuIsCollapsed ? 4 : 12,
            dl_desktop1214: 4,
          }}
          id="blue-section"
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="VPC" />

          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseLargeSpacing ? 7.5 : 4,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                dl_tablet950: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr',
                dl_desktop1030: menuIsCollapsed ? '1fr' : '1fr 1fr',
                dl_desktop1214: '1fr',
              },
            }}
          >
            {reverseSidebarItems.map((item, idx) => (
              <DataItem
                key={`reverse-sidebar-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor="#d7ecff"
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Bottom section - 3 Col */}
      <Grid
        container
        id="bottom-sections-container"
        columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}
      >
        <Grid
          size={{
            xs: 12,
            sm: 12,
            dl_tablet950: 4,
            md: 6,
            dl_desktop1030: menuIsCollapsed ? 4 : 6,
            dl_desktop1214: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="PUBLIC IP ADDRESSES" />
          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseLargeSpacing ? 7.5 : 4,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                dl_tablet950: '1fr',
                md: '1fr',
                dl_desktop1030: '1fr',
                dl_desktop1214: '1fr',
              },
            }}
          >
            {publicIpItems.map((item, idx) => (
              <DataItem
                key={`public-ip-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor={debugMode ? '#e2f5e2' : 'white'}
              />
            ))}
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
            dl_tablet950: 4,
            md: 6,
            dl_desktop1030: menuIsCollapsed ? 4 : 6,
            dl_desktop1214: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="ACCESS" />
          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseLargeSpacing ? 7.5 : 4,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                dl_tablet950: '1fr',
                md: '1fr',
                dl_desktop1030: '1fr',
                dl_desktop1214: '1fr',
              },
            }}
          >
            {accessItems.map((item, idx) => (
              <DataItem
                key={`access-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor={debugMode ? '#f5f5e2' : 'white'}
              />
            ))}
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
            dl_tablet950: 4,
            md: 12,
            dl_desktop1030: menuIsCollapsed ? 4 : 12,
            dl_desktop1214: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="FIREWALL" />
          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseLargeSpacing ? 7.5 : 4,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                dl_tablet950: '1fr',
                md: '1fr 1fr',
                dl_desktop1030: menuIsCollapsed ? '1fr' : '1fr 1fr',
                dl_desktop1214: '1fr',
              },
            }}
          >
            {firewallItems.map((item, idx) => (
              <DataItem
                key={`firewall-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor={debugMode ? '#f5e2e2' : 'white'}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};
