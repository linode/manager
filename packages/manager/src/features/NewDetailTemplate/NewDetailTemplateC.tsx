import React from 'react';
import Grid from '@mui/material/Grid2';
import { Typography, Box } from '@linode/ui';

type SectionHeaderProps = {
  children: React.ReactNode;
  [key: string]: any;
};

const SectionHeader = ({ children, ...props }: SectionHeaderProps) => (
  <Box
    sx={{
      background: '#f5f6f7',
      px: 1,
      py: 0.25,
      mb: 2,
      width: '100%',
    }}
    {...props}
  >
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Typography>
  </Box>
);

interface LabelValueProps {
  label: string;
  value: string;
}

const LabelValue = ({ label, value }: LabelValueProps) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export const NewDetailTemplateC = () => {
  return (
    <Box sx={{ width: '100%', background: 'white' }}>
      <Box sx={{ p: 3 }}>
        {/* SECTION 0: Dummy content */}
        <h1>Supporting Elements Approach</h1>
        <p>
          We can use extra, less important info to fill empty spots in the
          layout, making the design feel more balanced. (See "Placeholder"
          items.) This approach requires careful attention to detail when
          creating each view, since the balance won't come from the layout
          alone.
        </p>
        <Box sx={{ mb: 3, backgroundColor: 'white' }}>
          <Grid container>
            <Grid size={{ xs: 12, md: 8 }} sx={{ pr: { xs: 0, md: 6 } }}>
              <SectionHeader>SUMMARY</SectionHeader>

              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: { xs: 3, sm: 0 } }}>
                  <LabelValue label="Status" value="Running" />
                  <LabelValue label="CPU Core" value="1" />
                  <LabelValue label="RAM" value="2 GM" />
                  <LabelValue label="Volumes" value="0" />
                  <LabelValue label="Placeholder" value="[[Placeholder]]" />
                  <LabelValue label="Placeholder" value="[[Placeholder]]" />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <LabelValue label="Linode ID" value="44557799" />
                  <LabelValue label="Created" value="2025-05-20 23:30" />
                  <LabelValue label="Region" value="Washington, DC" />
                  <LabelValue label="Plan" value="Dedicated 4 GB" />
                  <LabelValue label="Encryption" value="🔒 Encrypted" />
                  <LabelValue label="Placeholder" value="[[Placeholder]]" />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ mt: { xs: 3, md: 0 } }}>
              <Grid container>
                <Grid
                  size={{ xs: 12, sm: 6, md: 12 }}
                  sx={{ pr: { xs: 0, sm: 2, md: 0 } }}
                >
                  <SectionHeader>VPC</SectionHeader>
                  <LabelValue label="Label" value="VPC-01-East" />
                  <LabelValue label="Subnets" value="fe-group" />
                  <LabelValue label="VPC IPv4" value="0.0.0.0" />
                </Grid>

                <Grid
                  size={{ xs: 12, sm: 6, md: 12 }}
                  sx={{ mt: { xs: 3, sm: 0, md: 3 } }}
                >
                  <SectionHeader>LKE</SectionHeader>
                  <LabelValue label="LKE Cluster" value="Dongo (175094)" />
                  <LabelValue label="LKE Cluster" value="Dongo (175094)" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
