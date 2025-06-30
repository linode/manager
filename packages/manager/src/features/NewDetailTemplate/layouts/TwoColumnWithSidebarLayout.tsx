// @ts-nocheck
import React from 'react';
import { Grid, Box } from '@mui/material';
import { DataItemType, ColumnConfig } from '../detailsData';
import { DataItem, SectionTitle } from '../commonComponents';

interface TwoColumnWithSidebarLayoutProps {
  isMobile: boolean;
  menuIsCollapsed: boolean;
  shouldUseLargeSpacing: boolean;
  sectionMarginBottom: number | string;
  mainSection: ColumnConfig;
  sidebarSection: ColumnConfig;
  debugMode?: boolean;
}

export const TwoColumnWithSidebarLayout: React.FC<
  TwoColumnWithSidebarLayoutProps
> = ({
  isMobile,
  menuIsCollapsed,
  shouldUseLargeSpacing,
  sectionMarginBottom,
  mainSection,
  sidebarSection,
  debugMode = false,
}) => {
  const mainItems = mainSection.items;
  const sidebarItems = sidebarSection.items;
  const mainTitle = mainSection.title;
  const sidebarTitle = sidebarSection.title;

  const mainBackgroundColor = debugMode
    ? '#ffd7d7'
    : mainSection.backgroundColor || 'white';
  const sidebarBackgroundColor = debugMode
    ? '#d7ecff'
    : sidebarSection.backgroundColor || 'white';

  const firstColumnItems = isMobile
    ? mainItems
    : mainItems.filter((_, index) => index % 2 === 0);

  const secondColumnItems = isMobile
    ? []
    : mainItems.filter((_, index) => index % 2 === 1);

  return (
    <Grid
      container
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
        sx={{ marginBottom: sectionMarginBottom }}
      >
        <SectionTitle title={mainTitle} />
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
                  key={`main-col1-${idx}`}
                  label={item.label}
                  value={item.value}
                  backgroundColor={mainBackgroundColor}
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
                sx={{ display: 'flex', flexDirection: 'column', rowGap: 1.75 }}
              >
                {secondColumnItems.map((item, idx) => (
                  <DataItem
                    key={`main-col2-${idx}`}
                    label={item.label}
                    value={item.value}
                    backgroundColor={mainBackgroundColor}
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
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
        <SectionTitle title={sidebarTitle} />
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
              key={`sidebar-${idx}`}
              label={item.label}
              value={item.value}
              backgroundColor={sidebarBackgroundColor}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TwoColumnWithSidebarLayout;
