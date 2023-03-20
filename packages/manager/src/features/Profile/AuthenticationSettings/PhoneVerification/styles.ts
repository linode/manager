import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  codeSentMessage: {
    marginTop: theme.spacing(1.5),
  },
  phoneNumberTitle: {
    fontSize: '.875rem',
    marginTop: theme.spacing(1.5),
  },
  buttonContainer: {
    gap: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(2),
    },
  },
  phoneNumberInput: {
    minWidth: '300px',
    border: 'unset',
    '&:focus': {
      boxShadow: 'unset',
      borderColor: 'unset',
    },
    '&.Mui-focused': {
      boxShadow: 'none',
      borderColor: 'unset',
    },
  },
  select: {
    width: '70px',
    height: '34px',
    border: 'unset',
    '&:focus': {
      boxShadow: 'unset',
      borderColor: 'unset',
    },
    '&.Mui-focused': {
      boxShadow: 'none',
      borderColor: 'unset',
    },
    '& .MuiInputBase-input .react-select__indicators svg': {
      color: `${theme.palette.primary.main} !important`,
      opacity: '1 !important',
    },
  },
  label: {
    marginTop: theme.spacing(2),
    color: theme.name === 'light' ? '#555' : '#c9cacb',
    padding: 0,
    fontSize: '.875rem',
    fontWeight: 400,
    lineHeight: '1',
    marginBottom: '8px',
    fontFamily: 'LatoWebBold',
  },
  inputContainer: {
    border: theme.name === 'light' ? '1px solid #ccc' : '1px solid #222',
    width: 'fit-content',
    transition: 'border-color 225ms ease-in-out',
  },
  focused:
    theme.name === 'light'
      ? {
          boxShadow: '0 0 2px 1px #e1edfa',
          borderColor: '#3683dc',
        }
      : {
          boxShadow: '0 0 2px 1px #222',
          borderColor: '#3683dc',
        },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    color: theme.color.red,
    top: 42,
    left: 5,
    width: '100%',
  },
}));
