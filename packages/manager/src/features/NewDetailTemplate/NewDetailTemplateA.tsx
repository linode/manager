import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

const DataItem = ({ label, value, color }) => (
  <div
    style={{
      backgroundColor: '#f7b731',
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
        color: '#2d3748',
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
        color: color || '#2d3748',
      }}
    >
      {value}
    </div>
  </div>
);

const distributeItems = (items, columns) => {
  const result = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    result[index % columns].push(item);
  });
  return result;
};

export const NewDetailTemplateA = () => {
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  let columns = 1;
  if (isDesktop) columns = 3;
  else if (isTablet) columns = 2;

  const dataItems = [
    { label: 'Status', value: 'A. Running', color: '#48bb78' },
    { label: 'CPU Core', value: 'B. 1' },
    { label: 'RAM', value: 'C. 2 GB' },
    { label: 'Label', value: 'Value' },
    { label: 'Label', value: 'Value' },
    { label: 'Label', value: 'Value' },
    { label: 'Label', value: 'Value' },
  ];

  const distributedItems = distributeItems(dataItems, columns);

  return (
    <div
      style={{
        width: '100%',
        padding: 20,
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 24,
          color: '#2d3748',
        }}
      >
        Responsive Data Items - Vertical Cascading Columns with MUI
        useMediaQuery
      </h1>

      <div
        style={{
          display: 'flex',
          gap: 16,
          flexDirection: columns === 1 ? 'column' : 'row',
        }}
      >
        {distributedItems.map((columnItems, colIndex) => (
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
                key={`${colIndex}-${idx}`}
                label={item.label}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
