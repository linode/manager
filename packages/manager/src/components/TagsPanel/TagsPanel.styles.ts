import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  addButtonWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
  },
  addTagButton: {
    '& svg': {
      color: theme.color.tagIcon,
      height: 10,
      marginLeft: 10,
      width: 10,
    },
    alignItems: 'center',
    backgroundColor: theme.color.tagButton,
    border: 'none',
    borderRadius: 3,
    color: theme.textColors.linkActiveLight,
    cursor: 'pointer',
    display: 'flex',
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    justifyContent: 'center',
    padding: '7px 10px',
    whiteSpace: 'nowrap',
  },
  errorNotice: {
    '& .noticeText': {
      fontFamily: '"LatoWeb", sans-serif',
    },
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.error.dark}`,
    marginTop: 20,
    paddingLeft: 10,
    textAlign: 'left',
  },
  hasError: {
    marginTop: 0,
  },
  loading: {
    opacity: 0.4,
  },
  progress: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    zIndex: 2,
  },
  selectTag: {
    '& .error-for-scroll > div': {
      flexDirection: 'row',
      flexWrap: 'wrap-reverse',
    },
    '& .input': {
      '& p': {
        borderLeft: 'none',
        color: theme.color.grey1,
        fontSize: '.9rem',
      },
    },
    '& .react-select__input': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      fontSize: '.9rem',
    },
    '& .react-select__value-container': {
      padding: '6px',
    },
    animation: '$fadeIn .3s ease-in-out forwards',
    marginTop: -3.5,
    minWidth: 275,
    position: 'relative',
    textAlign: 'left',
    width: '100%',
    zIndex: 3,
  },
  tag: {
    marginRight: 4,
    marginTop: theme.spacing(0.5),
  },
  tagsPanelItemWrapper: {
    marginBottom: theme.spacing(),
    position: 'relative',
  },
}));
