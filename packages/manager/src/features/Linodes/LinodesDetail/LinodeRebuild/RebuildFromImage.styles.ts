import { styled } from '@mui/material/styles';

import { Notice } from 'src/components/Notice/Notice';

export const StyledNotice = styled(Notice)({
  marginBottom: '0px !important',
  // @TODO: Remove the !important's once Notice.tsx has been refactored to use MUI's styled()
  padding: '8px !important',
});
