import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { DateCalendar } from '@mui/x-date-pickers';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(() => ({
  timeAutocomplete: {
    '.MuiBox-root': {
      marginTop: '0',
    },
    width: '140px',
  },
}));

export const StyledDateCalendar = styled(DateCalendar, {
  label: 'StyledDateCalendar',
})(({ theme }) => ({
  '.MuiButtonBase-root.MuiPickersDay-root.Mui-disabled': {
    color: theme.color.grey3,
  },
  '.MuiPickersArrowSwitcher-spacer': { width: '15px' },
  '.MuiPickersCalendarHeader-labelContainer': {
    fontSize: '0.95rem',
  },
  '.MuiPickersCalendarHeader-root': {
    marginTop: '0',
    paddingLeft: '17px',
    paddingRight: '3px',
  },
  '.MuiPickersCalendarHeader-switchViewIcon': {
    fontSize: '28px',
  },
  '.MuiPickersDay-root': {
    fontSize: '0.875rem',
    height: '32px',
    width: '32px',
  },
  '.MuiSvgIcon-root': {
    fontSize: '22px',
  },
  '.MuiTypography-root': {
    fontSize: '0.875rem',
    height: '32px',
    width: '32px',
  },
  '.MuiYearCalendar-root': {
    width: '260px',
  },
  marginLeft: '0px',
  width: '260px',
}));

export const StyledTypography = styled(Typography)(() => ({
  lineHeight: '20px',
  marginTop: '4px',
}));
