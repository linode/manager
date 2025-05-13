// @ts-nocheck
/* eslint-disable */
import React from 'react';
import Grid from '@mui/material/Grid';
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
    width="12"
    height="12"
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

const SectionHeader = ({ icon, title }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      backgroundColor: '#f1f5f9',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottom: '1px solid #e2e8f0',
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
      }}
    >
      {title}
    </Typography>
  </Box>
);

const DataCard = ({
  title,
  icon,
  children,
  backgroundColor,
  height,
  extraSpaceColor,
}) => (
  <Box
    sx={{
      backgroundColor: backgroundColor || 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      height: height || 'auto',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}
  >
    <SectionHeader icon={icon} title={title} />
    <Box
      sx={{
        flexGrow: extraSpaceColor ? 0 : 1,
        width: '100%',
      }}
    >
      {children}
    </Box>
    {extraSpaceColor && (
      <Box
        sx={{
          backgroundColor: extraSpaceColor,
          flexGrow: 1,
          width: '100%',
        }}
      />
    )}
  </Box>
);

const DataCell = ({ label, value, color, icon }) => (
  <Box
    sx={{
      padding: '8px 16px',
      borderBottom: '1px solid #edf2f7',
      borderRight: '1px solid #edf2f7',
      minWidth: '250px',
      width: '100%',
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#718096',
        marginBottom: '2px',
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
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {icon && (
        <Box sx={{ mr: '4px', display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
      )}
      {value}
    </Typography>
  </Box>
);

const TwoColumnRow = ({ left, right, background }) => (
  <Box
    sx={{
      display: 'flex',
      backgroundColor: background || 'transparent',
      width: '100%',
      '&:last-child .cell': {
        borderBottom: 'none',
      },
    }}
  >
    <Box sx={{ flex: 1, display: 'flex', width: '50%' }}>
      <DataCell
        label={left.label}
        value={left.value}
        color={left.color}
        icon={left.icon}
      />
    </Box>
    <Box sx={{ flex: 1, display: 'flex', width: '50%' }}>
      <DataCell
        label={right.label}
        value={right.value}
        color={right.color}
        icon={right.icon}
      />
    </Box>
  </Box>
);

const SingleColumnRow = ({ label, value }) => (
  <Box
    sx={{
      padding: '8px 16px',
      borderBottom: '1px solid #edf2f7',
      '&:last-child': {
        borderBottom: 'none',
      },
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#718096',
        marginBottom: '2px',
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#2d3748',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const LayoutTitle = ({ title }) => (
  <Typography
    variant="h2"
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

export const NewDetailTemplateB = () => {
  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <h1>Bounded Sections Approach</h1>
      <p>
        This approach uses card-style boxes with background colors to break up
        the page and make it feel more organized. Grouping related information
        this way helps reduce the appearance of too much white space, especially
        when column lengths are uneven.
      </p>
      <LayoutTitle title="Version 1: Natural Height Layout (Non-matching Heights)" />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <DataCard title="SUMMARY" icon={<SummaryIcon />} height="auto">
            <TwoColumnRow
              left={{ label: 'Status', value: 'Running', color: '#48bb78' }}
              right={{ label: 'CPU Core', value: '1' }}
              background="#f8fbff"
            />

            <TwoColumnRow
              left={{ label: 'RAM', value: '2 GM' }}
              right={{ label: 'Volumes', value: '0' }}
              background="white"
            />

            <TwoColumnRow
              left={{ label: 'Linode ID', value: '44557799' }}
              right={{ label: 'Created', value: '2025-05-20 23:30' }}
              background="#f8fbff"
            />

            <TwoColumnRow
              left={{ label: 'Region', value: 'Washington, DC' }}
              right={{ label: 'Plan', value: 'Dedicated 4 GB' }}
              background="white"
            />

            <TwoColumnRow
              left={{
                label: 'Encryption',
                value: 'Encrypted',
                icon: <LockIcon />,
              }}
              right={{ label: '', value: '' }}
              background="#f8fbff"
            />
          </DataCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <DataCard title="VPC" icon={<VpcIcon />} height="auto">
            <SingleColumnRow label="Label" value="VPC-01-East" />
            <SingleColumnRow label="Subnets" value="fe-group" />
            <SingleColumnRow label="VPC IPv4" value="0.0.0.0" />
          </DataCard>

          <DataCard title="LKE" icon={<ClusterIcon />} height="auto">
            <SingleColumnRow label="LKE Cluster" value="Dongo (175094)" />
            <SingleColumnRow label="LKE Cluster" value="Dongo (175094)" />
          </DataCard>
        </Grid>
      </Grid>

      <LayoutTitle title="Version 2: Equal Heights Layout with Background Color" />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', width: '100%' }}>
          <DataCard
            title="SUMMARY"
            icon={<SummaryIcon />}
            backgroundColor="white"
            extraSpaceColor="#f7f9fc"
            height="100%"
          >
            <TwoColumnRow
              left={{ label: 'Status', value: 'Running', color: '#48bb78' }}
              right={{ label: 'CPU Core', value: '1' }}
              background="#f8fbff"
            />

            <TwoColumnRow
              left={{ label: 'RAM', value: '2 GM' }}
              right={{ label: 'Volumes', value: '0' }}
              background="white"
            />

            <TwoColumnRow
              left={{ label: 'Linode ID', value: '44557799' }}
              right={{ label: 'Created', value: '2025-05-20 23:30' }}
              background="#f8fbff"
            />

            <TwoColumnRow
              left={{ label: 'Region', value: 'Washington, DC' }}
              right={{ label: 'Plan', value: 'Dedicated 4 GB' }}
              background="white"
            />

            <TwoColumnRow
              left={{
                label: 'Encryption',
                value: 'Encrypted',
                icon: <LockIcon />,
              }}
              right={{ label: '', value: '' }}
              background="#f8fbff"
            />
          </DataCard>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ flex: '0 0 auto' }}>
            <DataCard title="VPC" icon={<VpcIcon />} backgroundColor="white">
              <SingleColumnRow label="Label" value="VPC-01-East" />
              <SingleColumnRow label="Subnets" value="fe-group" />
              <SingleColumnRow label="VPC IPv4" value="0.0.0.0" />
            </DataCard>
          </Box>

          <Box sx={{ flex: '0 0 auto' }}>
            <DataCard
              title="LKE"
              icon={<ClusterIcon />}
              backgroundColor="white"
            >
              <SingleColumnRow label="LKE Cluster" value="Dongo (175094)" />
              <SingleColumnRow label="LKE Cluster" value="Dongo (175094)" />
            </DataCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
