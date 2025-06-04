// @ts-nocheck
/* eslint-disable */
import React from 'react';
import Grid from '@mui/material/Grid2';
import { Typography, Box } from '@linode/ui';

const SummaryIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
      fill="currentColor"
    />
  </svg>
);

const InstanceIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
      fill="currentColor"
    />
    <path d="M7 7H9V9H7V7Z" fill="currentColor" />
    <path d="M7 11H9V13H7V11Z" fill="currentColor" />
    <path d="M7 15H9V17H7V15Z" fill="currentColor" />
    <path d="M11 7H17V9H11V7Z" fill="currentColor" />
    <path d="M11 11H17V13H11V11Z" fill="currentColor" />
    <path d="M11 15H17V17H11V15Z" fill="currentColor" />
  </svg>
);

const VpcIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 20.5A7.5 7.5 0 1 1 15 5.5a7.5 7.5 0 0 1 0 15zm-9-5H2v-1h4v1zm0-3H4v-1h2v1zm0-3H3v-1h3v1zm5-5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
      fill="currentColor"
    />
  </svg>
);

const ClusterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 11H11V3H3V11ZM5 5H9V9H5V5Z" fill="currentColor" />
    <path d="M13 3V11H21V3H13ZM19 9H15V5H19V9Z" fill="currentColor" />
    <path d="M3 21H11V13H3V21ZM5 15H9V19H5V15Z" fill="currentColor" />
    <path d="M18 13H16V16H13V18H16V21H18V18H21V16H18V13Z" fill="currentColor" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z"
      fill="#805ad5"
    />
  </svg>
);

const DataItem = ({ label, value, color }) => (
  <Box sx={{ minWidth: '120px' }}>
    <Typography
      variant="body2"
      sx={{
        fontSize: '12px',
        color: '#718096',
        marginBottom: '4px',
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        fontSize: '14px',
        fontWeight: 500,
        color: color || '#2d3748',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
    <Box sx={{ marginRight: '8px', color: '#3182ce' }}>{icon}</Box>
    <Typography
      variant="subtitle2"
      sx={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#4a5568',
      }}
    >
      {title}
    </Typography>
  </Box>
);

const DataStrip = ({ title, icon, children }) => (
  <Box
    sx={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '16px 20px',
      marginBottom: '16px',
    }}
  >
    <SectionHeader icon={icon} title={title} />
    <Grid container spacing={3}>
      {children}
    </Grid>
  </Box>
);

const LeftSectionTitle = ({ icon, title }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'center',
      height: '100%',
      paddingRight: '16px',
      paddingLeft: '16px',
      borderRight: '1px solid #e2e8f0',
      width: '140px',

      '@media (max-width: 768px)': {
        width: '100%',
        paddingLeft: '0',
        paddingRight: '0',
        marginBottom: '12px',
        borderRight: 'none',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
      },
    }}
  >
    <Box sx={{ marginRight: '8px', color: '#3182ce' }}>{icon}</Box>
    <Typography
      variant="subtitle2"
      sx={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#4a5568',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        lineHeight: 1.2,
      }}
    >
      {title}
    </Typography>
  </Box>
);

const DataStripLeftTitle = ({ title, icon, children }) => (
  <Box
    sx={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      overflow: 'hidden',
      minHeight: '76px',
      display: 'flex',
      flexDirection: 'row',

      '@media (max-width: 768px)': {
        display: 'block',
        padding: '16px 20px',
      },
    }}
  >
    <LeftSectionTitle icon={icon} title={title} />
    <Box
      sx={{
        padding: '16px 20px',
        flexGrow: 1,
        '@media (max-width: 768px)': {
          padding: '12px 0 0 0',
        },
      }}
    >
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Box>
  </Box>
);

const LayoutTitle = ({ title }) => (
  <Typography
    variant="h3"
    sx={{
      fontSize: '18px',
      fontWeight: 600,
      marginTop: '40px',
      marginBottom: '16px',
      color: '#2d3748',
    }}
  >
    {title}
  </Typography>
);

export const NewDetailTemplateA = () => {
  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <h1>Horizontal Data Arrangement</h1>
      <p>
        This approach uses full-width rows to spread out information across the
        screen, following the way people naturally read from left to right. This
        helps the layout feel more balanced without needing to fill every empty
        spot.
      </p>

      <LayoutTitle title="Top-Aligned Titles" />

      {/* Summary Section */}
      <DataStrip title="SUMMARY" icon={<SummaryIcon />}>
        <Grid xs={6} sm={3} md={2}>
          <DataItem label="Status" value="Running" color="#48bb78" />
        </Grid>
        <Grid xs={6} sm={3} md={2}>
          <DataItem label="CPU Core" value="1" />
        </Grid>
        <Grid xs={6} sm={3} md={2}>
          <DataItem label="RAM" value="2 GB" />
        </Grid>
        <Grid xs={6} sm={3} md={2}>
          <DataItem label="Volumes" value="0" />
        </Grid>
      </DataStrip>

      {/* Instance Details */}
      <DataStrip title="INSTANCE DETAILS" icon={<InstanceIcon />}>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="Linode ID" value="44557799" />
        </Grid>
        <Grid xs={6} sm={4} md={3}>
          <DataItem label="Created" value="2025-05-20 23:30" />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="Region" value="Washington, DC" />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="Plan" value="Dedicated 4 GB" />
        </Grid>
        <Grid xs={6} sm={4} md={3}>
          <DataItem
            label="Encryption"
            value={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ marginRight: '6px' }}>
                  <LockIcon />
                </Box>
                Encrypted
              </Box>
            }
          />
        </Grid>
      </DataStrip>

      {/* VPC Information */}
      <DataStrip title="VPC INFO" icon={<VpcIcon />}>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="VPC Label" value="VPC-01-East" />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="Subnets" value="fe-group" />
        </Grid>
        <Grid xs={6} sm={4} md={2}>
          <DataItem label="VPC IPv4" value="10.0.4.1" />
        </Grid>
      </DataStrip>

      {/* LKE Cluster */}
      <DataStrip title="LKE CLUSTER" icon={<ClusterIcon />}>
        <Grid xs={6} sm={4} md={3}>
          <DataItem label="LKE Cluster" value="Dongo (175094)" />
        </Grid>
        <Grid xs={6} sm={4} md={3}>
          <DataItem label="LKE Cluster" value="Dongo (175094)" />
        </Grid>
      </DataStrip>

      {/* Left-Aligned Version Layout */}
      <LayoutTitle title="Left-Aligned Titles (Alternative)" />

      {/* Summary Section */}
      <DataStripLeftTitle title="Summary" icon={<SummaryIcon />}>
        <Grid xs={6} sm={3} md={3}>
          <DataItem label="Status" value="Running" color="#48bb78" />
        </Grid>
        <Grid xs={6} sm={3} md={3}>
          <DataItem label="CPU Core" value="1" />
        </Grid>
        <Grid xs={6} sm={3} md={3}>
          <DataItem label="RAM" value="2 GB" />
        </Grid>
        <Grid xs={6} sm={3} md={3}>
          <DataItem label="Volumes" value="0" />
        </Grid>
      </DataStripLeftTitle>

      {/* Instance Details */}
      <DataStripLeftTitle title="Instance Details" icon={<InstanceIcon />}>
        <Grid xs={6} sm={4} md={2.4}>
          <DataItem label="Linode ID" value="44557799" />
        </Grid>
        <Grid xs={6} sm={4} md={2.4}>
          <DataItem label="Created" value="2025-05-20 23:30" />
        </Grid>
        <Grid xs={6} sm={4} md={2.4}>
          <DataItem label="Region" value="Washington, DC" />
        </Grid>
        <Grid xs={6} sm={4} md={2.4}>
          <DataItem label="Plan" value="Dedicated 4 GB" />
        </Grid>
        <Grid xs={6} sm={4} md={2.4}>
          <DataItem
            label="Encryption"
            value={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ marginRight: '6px' }}>
                  <LockIcon />
                </Box>
                Encrypted
              </Box>
            }
          />
        </Grid>
      </DataStripLeftTitle>

      {/* VPC Information */}
      <DataStripLeftTitle title="VPC Info" icon={<VpcIcon />}>
        <Grid xs={6} sm={4} md={4}>
          <DataItem label="VPC Label" value="VPC-01-East" />
        </Grid>
        <Grid xs={6} sm={4} md={4}>
          <DataItem label="Subnets" value="fe-group" />
        </Grid>
        <Grid xs={6} sm={4} md={4}>
          <DataItem label="VPC IPv4" value="10.0.4.1" />
        </Grid>
      </DataStripLeftTitle>

      {/* LKE Cluster */}
      <DataStripLeftTitle title="LKE Cluster" icon={<ClusterIcon />}>
        <Grid xs={6} sm={6} md={6}>
          <DataItem label="LKE Cluster" value="Dongo (175094)" />
        </Grid>
        <Grid xs={6} sm={6} md={6}>
          <DataItem label="LKE Cluster" value="Dongo (175094)" />
        </Grid>
      </DataStripLeftTitle>
    </Box>
  );
};
