import React from 'react';
import { Box, Typography, Divider, Tooltip } from '@mui/material';

const TruncatedText = ({ text, ...props }) => {
  const textRef = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const handleMouseEnter = () => {
    if (textRef.current) {
      const isTruncated =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setShowTooltip(isTruncated);
    }
  };

  return (
    <Tooltip
      title={text}
      open={showTooltip}
      onOpen={() => handleMouseEnter()}
      onClose={() => setShowTooltip(false)}
      placement="top"
      arrow
    >
      <Typography
        ref={textRef}
        variant="body1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          ...props.sx,
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
};

const DataItem = ({ label, value, icon }) => (
  <Box
    sx={{
      width: {
        xs: '100%',
        sm: '230px',
        md: '250px',
      },
      mb: 0,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '100%',
      }}
    >
      {icon && <Box sx={{ flexShrink: 0, mr: 0.5 }}>{icon}</Box>}
      <TruncatedText text={value} />
    </Box>
  </Box>
);

const InfoSection = ({ title, items, isLast = false }) => {
  return (
    <Box>
      <Typography fontWeight="bold" sx={{ mb: 1.5, color: 'text.secondary' }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          '& > *': {
            flexGrow: 0,
            flexShrink: 0,
          },
        }}
      >
        {items.map((item, index) => (
          <DataItem
            key={`item-${index}`}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </Box>

      {!isLast && <Divider sx={{ mt: 1.5, mb: 1.5 }} />}
    </Box>
  );
};

export function NewDetailTemplateD() {
  return (
    <Box p={3} sx={{ bgcolor: '#f9f9fb' }}>
      <Box
        sx={{
          bgcolor: 'white',
          p: 3,
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          maxWidth: '100%',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Left-Aligned Titles (Alternative)
        </Typography>

        <InfoSection
          title="SUMMARY"
          items={[
            {
              label: 'Status',
              value: 'Running',
              icon: (
                <span style={{ color: 'green', marginRight: '4px' }}>●</span>
              ),
            },
            { label: 'CPU Core', value: '1' },
            { label: 'RAM', value: '2 GB' },
            { label: 'Volumes', value: '0' },
          ]}
        />

        <InfoSection
          title="INSTANCE DETAILS"
          items={[
            { label: 'Linode ID', value: '44557799' },
            { label: 'Created', value: '2025-05-20 23:30' },
            {
              label: 'Region',
              value:
                'Washington, DC - North America East Coast Region Super Extended Long Location Name That Should Definitely Truncate',
            },
            { label: 'Plan', value: 'Dedicated 4 GB' },
            {
              label: 'Encryption',
              value: 'Encrypted',
              icon: (
                <span
                  role="img"
                  aria-label="lock"
                  style={{ color: '#6c5ce7', marginRight: '4px' }}
                >
                  🔒
                </span>
              ),
            },
          ]}
        />

        <InfoSection
          title="VPC INFO"
          items={[
            { label: 'VPC Label', value: 'VPC-01-East' },
            { label: 'Subnets', value: 'fe-group' },
            { label: 'VPC IPv4', value: '10.0.4.1' },
          ]}
        />

        <InfoSection
          title="LKE CLUSTER"
          items={[
            { label: 'LKE Cluster', value: 'Dongo (175094)' },
            { label: 'LKE Cluster', value: 'Dongo (175094)' },
          ]}
          isLast={true}
        />
      </Box>
    </Box>
  );
}
