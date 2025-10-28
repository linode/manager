import { Typography } from '@linode/ui';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const iconModules = import.meta.glob('../../assets/icons/**/*.svg', {
  eager: true,
});

export const allIcons = Object.entries(iconModules)
  .map(([path, module]) => {
    const filename = path.split('/').pop()?.replace('.svg', '') || '';

    const name = filename
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return {
      name,
      component: (module as any).default,
      path,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export type IconName = (typeof allIcons)[number]['name'];

export interface IconGalleryProps {
  globalColor?: string;
  iconName: IconName;
  size?: number;
}

export const IconGallery: React.FC<IconGalleryProps> = ({
  iconName,
  globalColor,
  size = 48,
}) => {
  const theme = useTheme();
  const iconData = allIcons.find((icon) => icon.name === iconName);

  if (!iconData) {
    return <Typography color="error">Icon not found: {iconName}</Typography>;
  }

  const { component: IconComponent } = iconData;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        minWidth: 120,
        textAlign: 'center',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          mb: 1,
          '& svg': {
            width: '100%',
            height: '100%',
            ...(globalColor && {
              color: globalColor,
            }),
          },
        }}
      >
        <IconComponent
          height={size}
          style={{
            width: '100%',
            height: '100%',
          }}
          width={size}
        />
      </Box>
      <Typography
        sx={{ fontSize: '0.75rem', wordBreak: 'break-word' }}
        variant="caption"
      >
        {iconName}
      </Typography>
    </Box>
  );
};
