import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

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
    { label: 'Item', value: '1' },
    { label: 'Item', value: '2' },
    { label: 'Item', value: '3' },
  ];

  const gridItems = [
    { label: '2 Col Item', value: '1' },
    { label: '2 Col Item', value: '2' },
    { label: '2 Col Item', value: '3' },
    { label: '2 Col Item', value: '4' },
    { label: '2 Col Item', value: '5' },
    { label: '2 Col Item', value: '6' },
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
        3 Col Layout
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
                color={item.color || '#2d3748'}
                backgroundColor="#f7b731"
              />
            ))}
          </div>
        ))}
      </div>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          marginTop: 40,
          color: '#2d3748',
        }}
      >
        Side by Side Layout
      </h2>

      {isDesktop ? (
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexDirection: 'row',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {sidebarItems.map((item, idx) => (
              <DataItem
                key={`sidebar-${idx}`}
                label={item.label}
                value={item.value}
                color="#ffffff"
                backgroundColor="#3182ce"
              />
            ))}
          </div>

          <div
            style={{
              flex: 2,
              display: 'flex',
              gap: 16,
              flexDirection: 'row',
            }}
          >
            {distributedGridItems.map((columnItems, colIndex) => (
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
                    key={`grid-${colIndex}-${idx}`}
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
      ) : (
        <div>
          <div style={{ marginBottom: 24 }}>
            {isTablet ? (
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {sidebarItems
                    .filter((_, idx) => idx % 2 === 0)
                    .map((item, idx) => (
                      <DataItem
                        key={`sidebar-left-${idx}`}
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
                        key={`sidebar-right-${idx}`}
                        label={item.label}
                        value={item.value}
                        color="#ffffff"
                        backgroundColor="#3182ce"
                      />
                    ))}
                </div>
              </div>
            ) : (
              sidebarItems.map((item, idx) => (
                <DataItem
                  key={`sidebar-${idx}`}
                  label={item.label}
                  value={item.value}
                  color="#ffffff"
                  backgroundColor="#3182ce"
                />
              ))
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 16,
              flexDirection: isTablet ? 'row' : 'column',
            }}
          >
            {distributedGridItems.map((columnItems, colIndex) => (
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
                    key={`grid-${colIndex}-${idx}`}
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
      )}

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
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexDirection: 'row',
          }}
        >
          <div
            style={{
              flex: 2,
              display: 'flex',
              gap: 16,
              flexDirection: 'row',
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

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
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
          </div>
        </div>
      ) : (
        <div>
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

          <div>
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

      <div
        style={{
          width: '100%',
          marginTop: 40,
          padding: 20,
          backgroundColor: '#48bb78',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 16,
            color: '#2d3748',
          }}
        >
          Long Text
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#4a5568',
            margin: 0,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
          consequat dolor justo, vitae tincidunt nisi sollicitudin sed. Vivamus
          at tortor ut augue tincidunt tempus et at lectus. Nam rutrum sapien
          porttitor, dictum diam id, rutrum velit. Suspendisse sodales euismod
          dui et gravida. Integer volutpat non sem et blandit. Phasellus at
          magna ut mi pretium pharetra eget pretium orci. Donec gravida est dui,
          rhoncus ullamcorper tortor dignissim non. Nullam nulla est, euismod
          nec nisl vitae, porta blandit nibh.
        </p>
      </div>
    </div>
  );
};
