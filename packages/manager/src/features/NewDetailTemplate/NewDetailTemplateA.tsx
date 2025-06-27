// @ts-nocheck
import React from 'react';

import { Grid, Box, useMediaQuery } from '@mui/material';
import { useDetailsLayoutBreakpoints } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';

// Sets colored backgrounds to help visualize the layout
const debugMode = false;

const DataItemWrapper = styled('div', { label: 'DataItemWrapper' })(
  ({ theme, backgroundColor }) => ({
    backgroundColor: debugMode ? backgroundColor : 'white',
    borderRadius: 8,
    minWidth: 120,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 14,
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

export const NewDetailTemplateA = ({ menuIsCollapsed = false }) => {
  const theme = useTheme();
  const isDlFullSmall = useMediaQuery(theme.breakpoints.only('dl_fullSmall'));
  const isDlTabletSmall = useMediaQuery(
    theme.breakpoints.only('dl_tabletSmall')
  );

  const shouldUseGap4 = isDlFullSmall || isDlTabletSmall;

  const {
    isMobile,
    isTabletSmall,
    isTabletLarge,
    isTablet,
    isDesktop,
    isCollapsedSmall,
    isCollapsedLarge,
    isFullSmall,
    isFullLarge,
    getLayoutState,
  } = useDetailsLayoutBreakpoints(menuIsCollapsed);

  let columns = 1;
  if (isDesktop) columns = 3;
  else if (isTablet) columns = 2;

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
        spacing={shouldUseGap4 ? 4 : 7.5}
        sx={{ margin: 0 }}
      >
        <Grid
          size={{
            xs: 12,
            dl_tabletSmall: 12,
            dl_tabletLarge: 8,
            dl_fullSmall: 12,
            dl_fullLarge: 8,
          }}
          id="red-section"
        >
          <SectionTitle title="SUMMARY" />
          <Grid container spacing={shouldUseGap4 ? 4 : 7.5}>
            {distributedReverseGridItems.map((columnItems, colIndex) => (
              <Grid
                key={colIndex}
                size={{
                  xs: 12,
                  dl_tabletSmall: 6,
                  dl_tabletLarge: 6,
                  dl_fullSmall: 6,
                  dl_fullLarge: 6,
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
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid
          size={{
            xs: 12,
            dl_tabletSmall: 12,
            dl_tabletLarge: 4,
            dl_fullSmall: 12,
            dl_fullLarge: 4,
          }}
          id="blue-section"
        >
          <SectionTitle title="VPC" />

          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseGap4 ? 4 : 7.5,
              gridTemplateColumns: {
                xs: '1fr',
                dl_tabletSmall: '1fr 1fr',
                dl_tabletLarge: '1fr',
                dl_fullSmall: '1fr 1fr',
                dl_fullLarge: '1fr',
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
    </div>
  );
};
