// @ts-nocheck
import React from 'react';

import { Grid, Box, useMediaQuery } from '@mui/material';
import { useDetailsLayoutBreakpoints } from '@linode/ui';
import { useTheme } from '@mui/material/styles';

const DataItem = ({ label, value, color, backgroundColor }) => (
  <div
    style={{
      backgroundColor: backgroundColor,
      borderRadius: 8,
      padding: 16,
      minWidth: 120,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: 16,
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: color,
        marginBottom: 4,
        fontWeight: 400,
        opacity: 0.8,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: color,
      }}
    >
      {value}
    </div>
  </div>
);

const SectionTitle = ({ title, backgroundColor, color }) => (
  <div
    style={{
      backgroundColor: backgroundColor,
      color: color,
      padding: '10px 16px',
      borderRadius: '8px 8px 0 0',
      fontWeight: 600,
      fontSize: 18,
      marginBottom: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}
  >
    {title}
  </div>
);

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
    { label: 'Linode ID', value: '78979699' },
    { label: 'CPU Core', value: '1' },
    { label: 'Plan', value: 'Nanode 1 GB' },
    { label: 'Storage', value: '25 GB' },
    { label: 'Region', value: 'US, Atlanta, GA' },
    { label: 'RAM', value: '1 GB' },
    { label: 'Encryption', value: 'Encrypted' },
    { label: 'Volumes', value: '0' },
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
        padding: 27,
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'white',
      }}
    >
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          marginTop: 40,
          color: '#2d3748',
        }}
      >
        Reverse Layout (2-col left, single right)
      </h2>

      {/* {isDesktop ? ( */}
      <Grid
        container
        id="top-level-container"
        spacing={shouldUseGap4 ? 4 : 7}
        sx={{ margin: 0 }}
      >
        <Grid
          item
          size={{
            xs: 12,
            dl_tabletSmall: 12,
            dl_tabletLarge: 8,
            dl_fullSmall: 12,
            dl_fullLarge: 8,
          }}
          id="red-section"
        >
          <SectionTitle
            title="SUMMARY"
            backgroundColor="#e53e3e"
            color="#ffffff"
          />
          <Grid container spacing={shouldUseGap4 ? 4 : 7}>
            {distributedReverseGridItems.map((columnItems, colIndex) => (
              <Grid
                key={colIndex}
                item
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
                    color="#ffffff"
                    backgroundColor="#e53e3e"
                  />
                ))}
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid
          item
          size={{
            xs: 12,
            dl_tabletSmall: 12,
            dl_tabletLarge: 4,
            dl_fullSmall: 12,
            dl_fullLarge: 4,
          }}
          id="blue-section"
        >
          <SectionTitle title="VPC" backgroundColor="#3182ce" color="#ffffff" />

          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseGap4 ? 4 : 7,
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
                color="#ffffff"
                backgroundColor="#3182ce"
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};
