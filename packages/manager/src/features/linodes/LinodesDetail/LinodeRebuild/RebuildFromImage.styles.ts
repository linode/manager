import Notice from 'src/components/Notice';
import { styled } from '@mui/material/styles';

export const StyledNotice = styled(Notice)({
  // @TODO: Remove the !important's once Notice.tsx has been refactored to use MUI's styled()
  padding: '8px !important',
  marginBottom: '0px !important',
});
