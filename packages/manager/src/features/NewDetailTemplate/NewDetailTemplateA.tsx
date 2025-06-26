// @ts-nocheck
import React from 'react';
import { useTheme, useMediaQuery, Grid } from '@mui/material';

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

// Section Title component for headers
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

export const NewDetailTemplateA = () => {
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

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

      {isDesktop ? (
        <Grid
          container
          id="top-level-container"
          spacing={7}
          sx={{
            margin: 0,
          }}
        >
          <Grid item size={{ sm: 12, lg: 8 }} id="red-section">
            <SectionTitle
              title="SUMMARY"
              backgroundColor="#e53e3e"
              color="#ffffff"
            />
            <Grid container spacing={7}>
              {distributedReverseGridItems.map((columnItems, colIndex) => (
                <Grid key={colIndex} item size={{ lg: 6 }}>
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

          <Grid item size={{ sm: 12, lg: 4 }} id="blue-section">
            <SectionTitle
              title="VPC"
              backgroundColor="#3182ce"
              color="#ffffff"
            />
            {reverseSidebarItems.map((item, idx) => (
              <DataItem
                key={`reverse-sidebar-${idx}`}
                label={item.label}
                value={item.value}
                color="#ffffff"
                backgroundColor="#3182ce"
              />
            ))}
          </Grid>
        </Grid>
      ) : (
        <div>
          <div>
            <SectionTitle
              title="SUMMARY"
              backgroundColor="#e53e3e"
              color="#ffffff"
            />
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexDirection: isTablet ? 'row' : 'column',
                marginBottom: 24,
              }}
            >
              {distributedReverseGridItems.map((columnItems, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
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
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle
              title="VPC"
              backgroundColor="#3182ce"
              color="#ffffff"
            />
            {isTablet ? (
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {reverseSidebarItems
                    .filter((_, idx) => idx % 2 === 0)
                    .map((item, idx) => (
                      <DataItem
                        key={`reverse-sidebar-left-${idx}`}
                        label={item.label}
                        value={item.value}
                        color="#ffffff"
                        backgroundColor="#3182ce"
                      />
                    ))}
                </div>
                <div style={{ flex: 1 }}>
                  {sidebarItems
                    .filter((_, idx) => idx % 2 === 1)
                    .map((item, idx) => (
                      <DataItem
                        key={`reverse-sidebar-right-${idx}`}
                        label={item.label}
                        value={item.value}
                        color="#ffffff"
                        backgroundColor="#3182ce"
                      />
                    ))}
                </div>
              </div>
            ) : (
              reverseSidebarItems.map((item, idx) => (
                <DataItem
                  key={`reverse-sidebar-${idx}`}
                  label={item.label}
                  value={item.value}
                  color="#ffffff"
                  backgroundColor="#3182ce"
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
