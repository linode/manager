import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';

export const StyledButtonBox = styled(Box, { label: 'StyledButtonBox' })(
  ({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    margin: `${theme.spacing(3)} 0px`,
  })
);

export const StyledDownloadCSV = styled(DownloadCSV, { label: 'StyledDownloadCSV' })(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  textAlign: 'left',
}));