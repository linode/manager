// @ts-nocheck
import React from 'react';
import { Grid, Box } from '@mui/material';
import { DataItemType } from '../detailsData';
import { DataItem, SectionTitle } from './commonComponents';

interface ColumnConfig {
  title: string;
  items: DataItemType[];
  backgroundColor?: string;
}

interface ThreeColumnLayoutProps {
  columns: ColumnConfig[];
  menuIsCollapsed: boolean;
  shouldUseLargeSpacing: boolean;
  sectionMarginBottom: number | string;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  columns,
  menuIsCollapsed,
  shouldUseLargeSpacing,
  sectionMarginBottom,
}) => {
  // Ensure we always have exactly 3 columns
  const safeColumns = columns.slice(0, 3);
  while (safeColumns.length < 3) {
    safeColumns.push({ title: '', items: [], backgroundColor: 'white' });
  }

  return (
    <Grid container columnSpacing={shouldUseLargeSpacing ? 7.5 : 4}>
      {safeColumns.map((column, colIndex) => (
        <Grid
          key={`column-${colIndex}`}
          size={{
            xs: 12,
            sm: 12,
            dl_tablet950: 4,
            md: colIndex === 2 ? 12 : 6,
            dl_desktop1030: menuIsCollapsed ? 4 : colIndex === 2 ? 12 : 6,
            dl_desktop1214: 4,
          }}
          sx={{ marginBottom: sectionMarginBottom }}
        >
          {column.title && <SectionTitle title={column.title} />}
          <Box
            sx={{
              display: 'grid',
              columnGap: shouldUseLargeSpacing ? 7.5 : 4,
              rowGap: 1.75,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                dl_tablet950: '1fr',
                md: colIndex === 2 ? '1fr 1fr' : '1fr',
                dl_desktop1030: menuIsCollapsed
                  ? '1fr'
                  : colIndex === 2
                    ? '1fr 1fr'
                    : '1fr',
                dl_desktop1214: '1fr',
              },
            }}
          >
            {column.items.map((item, idx) => (
              <DataItem
                key={`col-${colIndex}-item-${idx}`}
                label={item.label}
                value={item.value}
                backgroundColor={column.backgroundColor || 'white'}
              />
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default ThreeColumnLayout;
