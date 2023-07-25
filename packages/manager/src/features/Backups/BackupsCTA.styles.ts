import { styled } from '@mui/material/styles';
import { Paper } from 'src/components/Paper';
import { IconButton } from 'src/components/IconButton';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  margin: `${theme.spacing(1)} 0 ${theme.spacing(3)} 0`,
  padding: theme.spacing(1),
  paddingRight: theme.spacing(2),
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  ...StyledLinkButton({ theme }),
  marginLeft: 12,
  lineHeight: '0.5rem',
}));
