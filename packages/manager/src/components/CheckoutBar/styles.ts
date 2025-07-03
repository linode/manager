import { useTheme } from '@mui/material/styles';

export const SxTypography = () => {
  const theme = useTheme();

  return {
    color: theme.color.headline,
    fontSize: '.8rem',
    lineHeight: '1.5em',
  };
};
