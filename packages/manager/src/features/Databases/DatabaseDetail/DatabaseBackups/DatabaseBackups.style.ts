import { styled } from '@mui/material/styles';
import { DateCalendar, TimePicker } from '@mui/x-date-pickers';

import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

export const StyledTimePicker = styled(TimePicker)(() => ({
  '.MuiInputAdornment-root': { marginRight: '0' },
  '.MuiInputBase-input': { padding: '8px 0 8px 12px' },
  '.MuiInputBase-root': { borderRadius: '0', padding: '0px' },

  'button.MuiButtonBase-root': {
    marginRight: '0',
    padding: '8px',
  },
  height: '34px',
  marginTop: '8px',
  width: '120px',
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

export const StyledBox = styled(Box)(({ theme }) => ({
  '& h6': {
    fontSize: '0.875rem',
  },
  '& span': {
    marginBottom: '5px',
    marginTop: '7px',
  },
  alignItems: 'flex-start',

  border: '1px solid #F4F4F4',
  color: theme.name === 'light' ? '#555555' : theme.color.headline,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '8px 15px',
  background: theme.name === 'light' ? '#FBFBFB' : theme.color.grey2,
}));

export const StyledTypography = styled(Typography)(() => ({
  lineHeight: '20px',
  marginTop: '4px',
}));
