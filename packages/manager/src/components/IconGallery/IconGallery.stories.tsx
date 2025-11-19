import { Typography } from '@linode/ui';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import React, { useMemo, useState } from 'react';

import { allIcons, IconGallery, type IconName } from './IconGallery';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof IconGallery> = {
  title: 'Icons/Icon Gallery',
  component: IconGallery,
  parameters: {
    docs: {
      description: {
        component:
          'A component for displaying individual SVG icons. Icons with defined colors (like database logos) preserve their original colors, while others can be customized with a global color override.',
      },
    },
  },
  argTypes: {
    globalColor: {
      control: { type: 'color' },
      description:
        "Override color for icons that don't have defined colors. Icons with fixed colors will not be affected.",
    },
    size: {
      control: { type: 'number' },
      description: 'Size of the icon in pixels',
    },
    iconName: {
      control: { type: 'select' },
      options: allIcons.map((icon) => icon.name),
      description: 'The name of the icon to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconGallery>;

export const SingleIcon: Story = {
  args: {
    iconName: 'Add',
    size: 48,
    globalColor: '#108ad6',
  },
};

const AllIconsComponent = ({
  globalColor = '#108ad6',
}: {
  globalColor?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return allIcons;
    }

    return allIcons.filter((icon) =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const statsInfo = useMemo(() => {
    const total = allIcons.length;
    const filtered = filteredIcons.length;

    return { total, filtered };
  }, [filteredIcons]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography gutterBottom variant="h4">
        Icon Gallery
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
        A searchable collection of {statsInfo.total} SVG icons. Icons with
        currentColor in their SVG will respond to color changes, while others
        preserve their original colors.
        {globalColor &&
          ` Global color override is active for changeable icons.`}
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search icons..."
          size="small"
          sx={{
            minWidth: 300,
            flexGrow: 1,
            maxWidth: 400,
            marginTop: 0,
            zIndex: 1,
            position: 'relative',
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
              },
            },
            '& .MuiInputBase-input': {
              backgroundColor: 'transparent',
              color: theme.palette.text.primary,
              zIndex: 2,
              position: 'relative',
            },
          }}
          value={searchTerm}
          variant="outlined"
        />
      </Box>

      <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
        Showing {statsInfo.filtered} of {statsInfo.total} icons
      </Typography>

      {filteredIcons.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 2,
          }}
        >
          {filteredIcons.map(({ name }) => (
            <IconGallery
              globalColor={globalColor}
              iconName={name as IconName}
              key={name}
              size={48}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: theme.palette.text.secondary,
          }}
        >
          <Typography gutterBottom variant="h6">
            No icons found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search term
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const AllIcons: Story = {
  args: {
    globalColor: '#108ad6',
  },
  argTypes: {
    iconName: { table: { disable: true } },
    size: { table: { disable: true } },
  },
  render: (args) => <AllIconsComponent globalColor={args.globalColor} />,
};
