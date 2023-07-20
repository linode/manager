import { styled } from '@mui/material/styles';
import { Paper } from 'src/components/Paper';
import { IconButton } from 'src/components/IconButton';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  margin: `${theme.spacing(1)} 0 ${theme.spacing(3)} 0`,
  padding: theme.spacing(1),
  paddingRight: theme.spacing(2),
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  ...theme.applyLinkStyles,
  marginLeft: 12,
  lineHeight: '0.5rem',
}));
