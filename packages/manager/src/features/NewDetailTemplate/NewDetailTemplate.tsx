import React from 'react';
import Grid from '@mui/material/Grid2';
import { Typography, Box } from '@linode/ui';
import { TagCell } from 'src/components/TagCell/TagCell';

interface SectionHeaderProps {
  children: React.ReactNode;
}
const SectionHeader = ({ children }: SectionHeaderProps) => (
  <Box
    sx={{
      background: '#f5f6f7',
      px: 1,
      py: 0.25,
      mb: 2,
      width: '100%',
    }}
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

export const NewDetailTemplate = () => {
  const handleUpdateTags = async (tags: string[]) => {
    return Promise.resolve();
  };

  const loremIpsum =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

  const exampleTags = [
    'center-core-x',
    'center-core-y',
    'center-core-z',
    'center-core-a',
    'center-core-b',
    'center-core-c',
    'center-core-d',
    'center-core-e',
    'center-core-f',
    'center-core-g',
    'center-core-h',
  ];

  return (
    <Box sx={{ width: '100%', background: 'white' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid #eee',
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }}>
          Linode [Name] Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            Power Off
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            Reboot
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            Launch LISH Console
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* SECTION 1: Full width, 1 column */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader>full width 1 column</SectionHeader>
          <LabelValue label="Label" value={loremIpsum} />
        </Box>

        {/* SECTION 2: Full width, 3 columns */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader>full width 3 columns</SectionHeader>
          <Grid container>
            <Grid size={4}>
              <LabelValue label="Label 2.1" value="Value 2.1" />
              <LabelValue label="Label 2.2" value="Value 2.2" />
              <LabelValue label="Label 2.3" value="Value 2.3" />
            </Grid>
            <Grid size={4}>
              <LabelValue label="Label 2.1" value="Value 2.1" />
              <LabelValue label="Label 2.2" value="Value 2.2" />
              <LabelValue label="Label 2.3" value="Value 2.3" />
            </Grid>
            <Grid size={4}>
              <LabelValue label="Label 2.1" value="Value 2.1" />
              <LabelValue label="Label 2.2" value="Value 2.2" />
              <LabelValue label="Label 2.3" value="Value 2.3" />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 3/4: 66%/33% width, 2 columns */}
        <Grid container sx={{ mb: 3 }}>
          <Grid size={8} sx={{ pr: 6 }}>
            <SectionHeader>66%/33% width - 2 columns</SectionHeader>
            <LabelValue label="Label 3.1" value={loremIpsum} />
          </Grid>
          <Grid size={4}>
            <SectionHeader>66%/33% width - 2 columns</SectionHeader>
            <LabelValue label="Label 4.1" value="Value 4.1" />
            <LabelValue label="Label 4.2" value="Value 4.2" />
          </Grid>
        </Grid>

        {/* SECTION 5/6: 33%/66% width, 2 columns */}
        <Grid container sx={{ mb: 3 }}>
          <Grid size={4} sx={{ pr: 6 }}>
            <SectionHeader>33%/66% width - 2 columns</SectionHeader>
            <LabelValue label="Label 5.1" value="Value 5.1" />
            <LabelValue label="Label 5.2" value="Value 5.2" />
            <LabelValue label="Label 5.3" value="Value 5.3" />
          </Grid>
          <Grid size={8}>
            <SectionHeader>S33%/66% width - 2 columns</SectionHeader>
            <LabelValue label="Label 6.1" value={loremIpsum} />
          </Grid>
        </Grid>

        {/* SECTION 7/8/9: 66%/33% width - 3 columns */}
        <Grid container sx={{ mb: 4 }}>
          <Grid size={8} sx={{ pr: 2 }}>
            <SectionHeader>66%/33% width - 3 columns</SectionHeader>

            <Grid container>
              <Grid size={6}>
                <LabelValue label="Label 7.1" value="Value 7.1" />
                <LabelValue label="Label 7.2" value="Value 7.2" />
                <LabelValue label="Label 7.3" value="Value 7.3" />
              </Grid>

              <Grid size={6}>
                <LabelValue label="Label 8.1" value="Value 8.1" />
                <LabelValue label="Label 8.2" value="Value 8.2" />
                <LabelValue label="Label 8.3" value="Value 8.3" />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={4}>
            <SectionHeader>66%/33% width - 3 columns</SectionHeader>
            <LabelValue label="Label 9.1" value="Value 9.1" />
            <LabelValue label="Label 9.2" value="Value 9.2" />
            <LabelValue label="Label 9.3" value="Value 9.3" />
          </Grid>
        </Grid>

        {/* SECTION 10/11/12: 33%/66% width - 3 columns */}
        <Grid container sx={{ mb: 4 }}>
          <Grid size={4} sx={{ pr: 2 }}>
            <SectionHeader>33%/66% width - 3 columns</SectionHeader>
            <LabelValue label="Label 10.1" value="Value 10.1" />
            <LabelValue label="Label 10.2" value="Value 10.2" />
            <LabelValue label="Label 10.3" value="Value 10.3" />
          </Grid>

          <Grid size={8}>
            <SectionHeader>33%/66% width - 3 columns</SectionHeader>
            <Grid container>
              <Grid size={6}>
                <LabelValue label="Label 11.1" value="Value 11.1" />
                <LabelValue label="Label 11.2" value="Value 11.2" />
                <LabelValue label="Label 11.3" value="Value 11.3" />
              </Grid>

              <Grid size={6}>
                <LabelValue label="Label 12.1" value="Value 12.1" />
                <LabelValue label="Label 12.2" value="Value 12.2" />
                <LabelValue label="Label 12.3" value="Value 12.3" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* SECTION 13/14/15: 33%/33%/33% width - 3 columns */}
        <Grid container sx={{ mb: 4 }}>
          <Grid size={4} sx={{ pr: 2 }}>
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 13.1" value="Value 13.1" />
            <LabelValue label="Label 13.2" value="Value 13.2" />
            <LabelValue label="Label 13.3" value="Value 13.3" />
          </Grid>
          <Grid size={4} sx={{ pr: 2 }}>
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 14.1" value="Value 14.1" />
            <LabelValue label="Label 14.2" value="Value 14.2" />
            <LabelValue label="Label 14.3" value="Value 14.3" />
          </Grid>
          <Grid size={4}>
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 15.1" value="Value 15.1" />
            <LabelValue label="Label 15.2" value="Value 15.2" />
            <LabelValue label="Label 15.3" value="Value 15.3" />
          </Grid>
        </Grid>

        {/* SECTION 16/17/18/19/20: 33%/33%/33% width - 3 columns + several sections in 2nd col*/}
        <Grid container sx={{ mb: 4 }}>
          <Grid size={4} sx={{ pr: 2 }}>
            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 16.1" value="Value 16.1" />
            <LabelValue label="Label 16.2" value="Value 16.2" />
            <LabelValue label="Label 16.3" value="Value 16.3" />
          </Grid>
          <Grid size={4} sx={{ pr: 2 }}>
            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 17.1" value="Value 17.1" />

            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 18.1" value="Value 18.1" />

            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 19.1" value="Value 19.1" />
            <LabelValue label="Label 19.2" value="Value 19.2" />
          </Grid>
          <Grid size={4}>
            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 20.1" value="Value 20.1" />
            <LabelValue label="Label 20.2" value="Value 20.2" />
            <LabelValue label="Label 20.3" value="Value 20.3" />
          </Grid>
        </Grid>

        {/* TAGS */}
        <Grid container sx={{ mb: 4 }}>
          <SectionHeader>tags full width</SectionHeader>
          <Grid size={12}>
            <TagCell
              tags={exampleTags}
              updateTags={handleUpdateTags}
              view="inline"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
