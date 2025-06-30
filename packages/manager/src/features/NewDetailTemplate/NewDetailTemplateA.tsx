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

export const DataItemLabel = styled('div', { label: 'DataItemLabel' })(
  ({ theme }) => ({
    fontSize: 14,
    color: theme.textColors.tableStatic,
    marginBottom: 4,
    fontWeight: theme.font.bold,
  })
);

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

const DataItem = ({ label, value, backgroundColor = 'white' }) => (
  <DataItemWrapper backgroundColor={backgroundColor}>
    <DataItemLabel>{label}</DataItemLabel>
    <DataItemValue>{value}</DataItemValue>
  </DataItemWrapper>
);

const SectionTitle = ({ title }) => (
  <SectionTitleWrapper>{title}</SectionTitleWrapper>
);

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

  // Mobile: all items in one column
  // Desktop: alternating items in two columns
  const firstColumnItems = isMobile
    ? gridItems
    : gridItems.filter((_, index) => index % 2 === 0);

  const secondColumnItems = isMobile
    ? []
    : gridItems.filter((_, index) => index % 2 === 1);

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

      {/* Top Container - Summary and VPC */}
      <Grid
        container
        columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}
        sx={{ margin: 0 }}
      >
        {/* SUMMARY Section */}
        <Grid
          size={{
            xs: 12,
            dl_tablet950: 8,
            sm: 12,
            md: 12,
            dl_desktop1030: menuIsCollapsed ? 8 : 12,
            dl_desktop1214: 8,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="SUMMARY" />
          <Grid
            container
            columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}
            rowSpacing={isMobile ? 1.75 : 0}
          >
            {/* First Column */}
            <Grid
              size={{
                xs: 12,
                sm: 6,
                dl_tablet950: 6,
                md: 6,
                dl_desktop1030: 6,
                dl_desktop1214: 6,
              }}
            >
              <Box
                sx={{ display: 'flex', flexDirection: 'column', rowGap: 1.75 }}
              >
                {firstColumnItems.map((item, idx) => (
                  <DataItem
                    key={`summary-col1-${idx}`}
                    label={item.label}
                    value={item.value}
                    backgroundColor="#ffd7d7"
                  />
                ))}
              </Box>
            </Grid>

            {/* Second Column - Only on tablet/desktop */}
            {!isMobile && (
              <Grid
                size={{
                  sm: 6,
                  dl_tablet950: 6,
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
                  {secondColumnItems.map((item, idx) => (
                    <DataItem
                      key={`summary-col2-${idx}`}
                      label={item.label}
                      value={item.value}
                      backgroundColor="#ffd7d7"
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* VPC Section */}
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
          <SectionTitle title="VPC" />
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
            {sidebarItems.map((item, idx) => (
              <DataItem
                key={`vpc-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor="#d7ecff"
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Bottom Container - IP Addresses, Access, and Firewall */}
      <Grid container columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}>
        {/* PUBLIC IP ADDRESSES Section */}
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
                key={`ip-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor={debugMode ? '#e2f5e2' : 'white'}
              />
            ))}
          </Box>
        </Grid>

        {/* ACCESS Section */}
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

        {/* FIREWALL Section */}
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
