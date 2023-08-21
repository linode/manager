import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';
import { isPropValid } from 'src/utilities/isPropValid';

type StyledCopyTooltipProps = { isHovered: boolean };

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip ',
  shouldForwardProp: (prop) => isPropValid(['isHovered'], prop),
})<StyledCopyTooltipProps>(({ isHovered }) => ({
  '& svg': {
    height: `12px`,
    width: `12px`,
  },
  ':focus': {
    opacity: 1,
  },
  marginLeft: 4,
  opacity: isHovered ? 1 : 0,
  top: 1,
}));

export const StyledActionTableCell = styled(TableCell, {
  label: 'StyledActionTableCell',
})(({ theme }) => ({
  '& a': {
    marginRight: theme.spacing(1),
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 0,
  paddingRight: `0px !important`,
}));

export const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      padding: 5,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
      marginTop: `-${theme.spacing(1)}`,
    },
  })
);

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})({
  lineHeight: '1.5rem',
  marginBottom: 8,
  marginLeft: 15,
  marginTop: 8,
});

export const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%',
  })
);
