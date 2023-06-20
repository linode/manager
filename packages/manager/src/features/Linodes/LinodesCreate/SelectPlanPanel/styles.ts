import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { isPropValid } from 'src/utilities/isPropValid';
import { TableRow, TableRowProps } from 'src/components/TableRow';
import Typography from 'src/components/core/Typography';

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  () => {
    const theme = useTheme();

    return {
      fontSize: '0.9em',
      '& a': {
        color: theme.textColors.linkActiveLight,
      },
      '& a:hover': {
        color: '#3683dc',
      },
      '& p': {
        fontFamily: '"LatoWebBold", sans-serif',
      },
    };
  }
);

export interface StyledDisabledTableRowProps extends TableRowProps {
  disabled?: boolean;
}

const StyledDisabledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => isPropValid(['disabled'], prop),
})<StyledDisabledTableRowProps>(({ ...props }) => {
  const theme = useTheme();

  return {
    ...(props.disabled && {
      backgroundColor: theme.bg.tableHeader,
      cursor: 'not-allowed',
      opacity: 0.4,
    }),
    '&:focus-within': {
      backgroundColor: theme.bg.lightBlue1,
    },
  };
});

export { StyledDisabledTableRow, StyledTypography };
