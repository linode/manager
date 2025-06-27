// @ts-nocheck
import React from 'react';

import { Grid, Box, useMediaQuery } from '@mui/material';
import { useDetailsLayoutBreakpoints } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';

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

const DataItem = ({ label, value, color, backgroundColor }) => (
  <DataItemWrapper backgroundColor={backgroundColor}>
    <DataItemLabel color={color}>{label}</DataItemLabel>
    <DataItemValue color={color}>{value}</DataItemValue>
  </DataItemWrapper>
);

const SectionTitle = ({ title }) => {
  return <SectionTitleWrapper>{title}</SectionTitleWrapper>;
};

const distributeItems = (items, columns) => {
  const result = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    result[index % columns].push(item);
  });
  return result;
};

const distributeItemsSequentially = (items, columns) => {
  const result = Array.from({ length: columns }, () => []);
  const itemsPerColumn = Math.ceil(items.length / columns);

  items.forEach((item, index) => {
    const columnIndex = Math.floor(index / itemsPerColumn);
    result[columnIndex].push(item);
  });

  return result;
};

export const NewDetailTemplateA = () => {
  const theme = useTheme();
  const isDlFullSmall = useMediaQuery(theme.breakpoints.only('dl_fullSmall'));
  const isDlTabletSmall = useMediaQuery(
    theme.breakpoints.only('dl_tabletSmall')
  );

  const {
    isMobile,
    isTabletSmall,
    isTabletLarge,
    isTablet,
    isDesktop,
    isDesktopNavClosedSmall,
    isDesktopNavClosedLarge,
    isDesktopNavOpenedSmall,
    isDesktopNavOpenedLarge,
    menuIsCollapsed,
    getLayoutState,
  } = useDetailsLayoutBreakpoints();

  let columns = 1;
  if (isDesktop) columns = 3;
  else if (isTablet) columns = 2;

  const isDesktop1030Up = useMediaQuery(theme.breakpoints.up('dl_desktop1030'));
  const isDesktop1214Up = useMediaQuery(theme.breakpoints.up('dl_desktop1214'));
  const isTablet950ToMd = useMediaQuery(
    theme.breakpoints.between('dl_tablet950', 'md')
  );

  const cond1 = (isDesktop1030Up && menuIsCollapsed) || isDesktop1214Up;
  const cond2 = isTablet950ToMd;

  const shouldUseLargeSpacing = cond1 || cond2;

  const shouldUseGap4 = isDlFullSmall || isDlTabletSmall;
  const sectionMarginBottom = isMobile
    ? theme.spacingFunction(24)
    : theme.spacingFunction(16);

  const dataItems = [
    { label: '3 Col Item', value: 'A' },
    { label: '3 Col Item', value: 'B' },
    { label: '3 Col Item', value: 'C' },
    { label: '3 Col Item', value: 'D' },
    { label: '3 Col Item', value: 'E' },
    { label: '3 Col Item', value: 'F' },
    { label: '3 Col Item', value: 'G' },
  ];

  const sidebarItems = [
    { label: 'Label', value: 'VPC-01-East' },
    { label: 'Subnets', value: 'se-group' },
    { label: 'VPC IPv4', value: '10.0.0.0' },
  ];

  const gridItems = [
    { label: 'Status', value: 'Running' },
    { label: 'CPU Core', value: '1' },
    { label: 'Storage', value: '25 GB' },
    { label: 'RAM', value: '1 GB' },
    { label: 'Volumes', value: '0' },
    { label: 'Linode ID', value: '78979699' },
    { label: 'Plan', value: 'Nanode 1 GB' },
    { label: 'Region', value: 'US, Atlanta, GA' },
    { label: 'Encryption', value: 'Encrypted' },
    { label: 'Created', value: '2025-06-20 13:35' },
  ];

  const publicIpItems = [
    { label: 'Address 1', value: '50.116.6.212' },
    { label: 'Address 2', value: '2600:3c00::f03c:92ff:fee2:6c40/64' },
    { label: 'View all IP Addresses', value: '' },
  ];

  const accessItems = [
    { label: 'SSH Access', value: 'ssh root@50.116.6.212' },
    {
      label: 'LISH Console via SSH',
      value: 'ssh -t mock-user@lish-us-ord.linode.com linode-detail',
    },
  ];

  const firewallItems = [
    { label: 'Label', value: 'mock-firewall-1' },
    { label: 'ID', value: '112233' },
  ];

  const reverseGridItems = gridItems.map((item) => ({ ...item }));
  const reverseSidebarItems = sidebarItems.map((item) => ({ ...item }));

  const distributedItems = distributeItems(dataItems, columns);
  const distributedGridItems = distributeItemsSequentially(gridItems, 2);
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
      <h2>(2-col left, single right)</h2>
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
      {/* <Grid
        container
        id="bottom-sections-container"
        columnSpacing={shouldUseGap4 ? 4 : 7.5}
      >
        <Grid
          size={{
            xs: 12,
            dl_tabletSmall: 12,
            dl_tabletLarge: 4,
            dl_fullSmall: 6,
            dl_fullLarge: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="PUBLIC IP ADDRESSES" />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 1.75,
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
            dl_tabletSmall: 12,
            dl_tabletLarge: 4,
            dl_fullSmall: 6,
            dl_fullLarge: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="ACCESS" />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: 1.75,
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
            dl_tabletSmall: 12,
            dl_tabletLarge: 4,
            dl_fullSmall: 12,
            dl_fullLarge: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          <SectionTitle title="FIREWALL" />
          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseGap4 ? 4 : 7.5,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                dl_tabletSmall: '1fr 1fr',
                dl_tabletLarge: '1fr',
                dl_fullSmall: '1fr 1fr',
                dl_fullLarge: '1fr',
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
      </Grid> */}
    </div>
  );
};
