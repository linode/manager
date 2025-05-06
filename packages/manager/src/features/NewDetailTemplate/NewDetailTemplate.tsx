import React from 'react';
import Grid from '@mui/material/Grid2';
import { Typography, Box } from '@linode/ui';
import { TagCell } from 'src/components/TagCell/TagCell';

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
        <Box sx={{ mb: 3, backgroundColor: 'lightyellow' }}>
          <SectionHeader>full width 1 column</SectionHeader>
          <LabelValue label="Label 1.1" value={loremIpsum} />
        </Box>

        {/* SECTION 2: Full width, 3 columns */}
        <Box sx={{ mb: 3, backgroundColor: 'lightcoral' }}>
          <SectionHeader>FULL WIDTH 3 COLUMNS</SectionHeader>
          <Grid container>
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              order={{ xs: 1, sm: 1, md: 1 }}
            >
              <LabelValue label="Label 2.1 A" value="Value 2.1 A" />
              <LabelValue label="Label 2.2 A" value="Value 2.2 A" />
              <LabelValue label="Label 2.3 A" value="Value 2.3 A" />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              order={{ xs: 2, sm: 3, md: 2 }}
            >
              <LabelValue label="Label 2.1 B" value="Value 2.1 B" />
              <LabelValue label="Label 2.2 B" value="Value 2.2 B" />
              <LabelValue label="Label 2.3 B" value="Value 2.3 B" />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              order={{ xs: 3, sm: 2, md: 3 }}
            >
              <LabelValue label="Label 2.1 C" value="Value 2.1 C" />
              <LabelValue label="Label 2.2 C" value="Value 2.2 C" />
              <LabelValue label="Label 2.3 C" value="Value 2.3 C" />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 3/4: 66%/33% width, 2 columns */}
        <Grid container sx={{ mb: 3, backgroundColor: 'lightblue' }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ pr: { xs: 0, md: 6 } }}>
            <SectionHeader>66%/33% width - 2 columns</SectionHeader>
            <LabelValue label="Label 3.1" value={loremIpsum} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionHeader>66%/33% width - 2 columns</SectionHeader>
            <LabelValue label="Label 4.1" value="Value 4.1" />
            <LabelValue label="Label 4.2" value="Value 4.2" />
          </Grid>
        </Grid>

        {/* SECTION 5/6: 33%/66% width, 2 columns */}
        <Grid container sx={{ mb: 3, backgroundColor: 'lightgreen' }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ pr: { xs: 0, md: 6 } }}>
            <SectionHeader>33%/66% width - 2 columns</SectionHeader>
            <LabelValue label="Label 5.1" value="Value 5.1" />
            <LabelValue label="Label 5.2" value="Value 5.2" />
            <LabelValue label="Label 5.3" value="Value 5.3" />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionHeader>33%/66% width - 2 columns</SectionHeader>
            <LabelValue label="Label 6.1" value={loremIpsum} />
          </Grid>
        </Grid>

        {/* SECTION 7/8/9: 66%/33% width - 3 columns */}
        <Grid container sx={{ mb: 4, backgroundColor: 'lightsalmon' }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ pr: { xs: 0, md: 6 } }}>
            <SectionHeader>66%/33% width - 3 columns</SectionHeader>

            <Grid container>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: { xs: 3, sm: 0 } }}>
                <LabelValue label="Label 7.1" value="Value 7.1" />
                <LabelValue label="Label 7.2" value="Value 7.2" />
                <LabelValue label="Label 7.3" value="Value 7.3" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <LabelValue label="Label 8.1" value="Value 8.1" />
                <LabelValue label="Label 8.2" value="Value 8.2" />
                <LabelValue label="Label 8.3" value="Value 8.3" />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: { xs: 3, md: 0 } }}>
            <SectionHeader>33% width column</SectionHeader>
            <LabelValue label="Label 9.1" value="Value 9.1" />
            <LabelValue label="Label 9.2" value="Value 9.2" />
            <LabelValue label="Label 9.3" value="Value 9.3" />
          </Grid>
        </Grid>

        {/* SECTION 10/11/12: 33%/66% width - 3 columns */}
        <Grid container sx={{ mb: 4, backgroundColor: 'lightcyan' }}>
          {/* Main left section (33% on desktop) */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ pr: { xs: 0, md: 6 }, mb: { xs: 3, md: 0 } }}
          >
            <SectionHeader>33%/66% width - 3 columns</SectionHeader>
            <LabelValue label="Label 10.1" value="Value 10.1" />
            <LabelValue label="Label 10.2" value="Value 10.2" />
            <LabelValue label="Label 10.3" value="Value 10.3" />
          </Grid>

          {/* Main right section (66% on desktop) */}
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionHeader>33%/66% width - 3 columns</SectionHeader>
            <Grid container>
              {/* First nested column */}
              <Grid size={{ xs: 12, sm: 6 }} sx={{ mb: { xs: 3, sm: 0 } }}>
                <LabelValue label="Label 11.1" value="Value 11.1" />
                <LabelValue label="Label 11.2" value="Value 11.2" />
                <LabelValue label="Label 11.3" value="Value 11.3" />
              </Grid>

              {/* Second nested column */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <LabelValue label="Label 12.1" value="Value 12.1" />
                <LabelValue label="Label 12.2" value="Value 12.2" />
                <LabelValue label="Label 12.3" value="Value 12.3" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* SECTION 13/14/15: 33%/33%/33% width - 3 columns */}
        <Grid container sx={{ mb: 4, backgroundColor: 'lavender' }}>
          {/* First column */}
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{ pr: { xs: 0, md: 6 }, mb: { xs: 3, sm: 0 } }}
          >
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 13.1" value="Value 13.1" />
            <LabelValue label="Label 13.2" value="Value 13.2" />
            <LabelValue label="Label 13.3" value="Value 13.3" />
          </Grid>

          {/* Second column */}
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{ pr: { xs: 0, md: 6 }, mb: { xs: 3, sm: 3, md: 0 } }}
          >
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 14.1" value="Value 14.1" />
            <LabelValue label="Label 14.2" value="Value 14.2" />
            <LabelValue label="Label 14.3" value="Value 14.3" />
          </Grid>

          {/* Third column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionHeader>33%/33%/33% width</SectionHeader>
            <LabelValue label="Label 15.1" value="Value 15.1" />
            <LabelValue label="Label 15.2" value="Value 15.2" />
            <LabelValue label="Label 15.3" value="Value 15.3" />
          </Grid>
        </Grid>

        {/* SECTION 16/17/18/19/20: 33%/33%/33% width - 3 columns + several sections in 2nd col*/}
        <Grid container sx={{ mb: 4, backgroundColor: '#d2ffc4' }}>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ pr: { xs: 0, md: 2 }, mb: { xs: 4, md: 0 } }}
          >
            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 16.1" value="Value 16.1" />
            <LabelValue label="Label 16.2" value="Value 16.2" />
            <LabelValue label="Label 16.3" value="Value 16.3" />
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ pr: { xs: 0, md: 2 }, mb: { xs: 4, md: 0 } }}
          >
            <SectionHeader>3 cols + several sections in 2nd col</SectionHeader>
            <LabelValue label="Label 17.1" value="Value 17.1" />

            <Box sx={{ mt: 3 }}>
              <SectionHeader>
                3 cols + several sections in 2nd col
              </SectionHeader>
              <LabelValue label="Label 18.1" value="Value 18.1" />
            </Box>

            <Box sx={{ mt: 3 }}>
              <SectionHeader>
                3 cols + several sections in 2nd col
              </SectionHeader>
              <LabelValue label="Label 19.1" value="Value 19.1" />
              <LabelValue label="Label 19.2" value="Value 19.2" />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
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
