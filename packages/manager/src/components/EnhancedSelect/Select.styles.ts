import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export const useStyles = makeStyles()((theme: Theme) => ({
  algoliaRoot: {
    '& em': {
      color: theme.color.blueDTwhite,
      fontStyle: 'normal',
    },
    cursor: 'pointer',
    padding: `calc(${theme.spacing(1)} / 2 + 2)`,
    width: '100%',
  },
  divider: {
    height: theme.spacing(2),
  },
  finalLink: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '1.2em',
    paddingLeft: theme.spacing(1),
  },
  hideLabel: {
    '& label': { ...theme.visually.hidden },
  },
  highlight: {
    color: theme.palette.primary.main,
  },
  icon: {
    color: theme.palette.primary.main,
    display: 'inline-block',
    height: 12,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    position: 'relative',
    top: 5,
    width: 12,
  },
  inline: {
    '& label': {
      marginRight: theme.spacing(1),
      position: 'relative',
      top: 1,
      whiteSpace: 'nowrap',
    },
    alignItems: 'center',
    display: 'inline-flex',
    flexDirection: 'row',
  },
  input: {
    // recommend targeting the input element in your own stylesheet with the following rule:"
    '::-ms-clear': { display: 'none' },
    color: theme.palette.text.primary,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '0.9rem',
    minHeight: `calc(${theme.spacing(5)} - 6)`,
    padding: 0,
    // From the AutoSizeInput documentation: (https://github.com/JedWatson/react-input-autosize/blob/master/README.md#csp-and-the-ie-clear-indicator)
    // "The input will automatically inject a stylesheet that hides IE/Edge's "clear" indicator,
    // which otherwise breaks the UI. This has the downside of being incompatible with some CSP policies.
    // To work around this, you can pass the injectStyles={false} prop, but if you do this I strongly
    [theme.breakpoints.only('xs')]: {
      fontSize: '1rem',
    },
  },
  label: {
    color: theme.palette.text.primary,
    display: 'inline',
    maxWidth: '95%',
  },
  medium: {
    minHeight: 40,
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  },
  resultContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  root: {
    '& .react-select__clear-indicator': {
      '& svg': {
        '&:hover': {
          color: theme.palette.primary.main,
        },
        color: theme.color.grey4,
      },
      padding: 0,
    },
    '& .react-select__control': {
      '&:hover': {
        border: `1px dotted #ccc`,
        cursor: 'text',
      },
      '&--is-focused, &--is-focused:hover': {
        border: `1px dotted #999`,
      },
      backgroundColor: theme.bg.white,
      border: `1px solid transparent`,
      borderRadius: 0,
      boxShadow: 'none',
      minHeight: `calc(${theme.spacing(5)} - 2)`,
    },
    '& .react-select__dropdown-indicator': {},
    '& .react-select__group': {
      '&:last-child': {
        paddingBottom: 0,
      },
      width: '100%',
    },
    '& .react-select__group-heading': {
      color: theme.color.headline,
      fontFamily: theme.font.bold,
      fontSize: '1rem',
      paddingLeft: 10,
      paddingRight: 10,
      textTransform: 'initial',
    },
    '& .react-select__indicator-separator': {
      display: 'none',
    },
    '& .react-select__input': {
      color: theme.palette.text.primary,
      width: '100%',
    },
    '& .react-select__menu': {
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: 0,
      boxShadow: 'none',
      margin: '-1px 0 0 0',
      maxWidth: 415,
      zIndex: 100,
    },
    '& .react-select__menu-list': {
      '&::-webkit-scrollbar': {
        appearance: 'none',
      },
      '&::-webkit-scrollbar:vertical': {
        width: 8,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#ccc',
        borderRadius: 8,
      },
      backgroundColor: theme.bg.white,
      height: '101%',
      maxHeight: 285,
      overflow: 'auto',
      padding: theme.spacing(0.5),
      zIndex: 100,
    },
    '& .react-select__multi-value': {
      alignItems: 'center',
      backgroundColor: theme.bg.lightBlue1,
      borderRadius: 4,
    },
    '& .react-select__multi-value__label': {
      color: theme.palette.text.primary,
      fontSize: '.8rem',
      height: 20,
      marginBottom: 2,
      marginRight: 4,
      marginTop: 2,
      paddingLeft: 6,
      paddingRight: 0,
    },
    '& .react-select__multi-value__remove': {
      '& svg': {
        color: theme.palette.text.primary,
        height: 12,
        width: 12,
      },
      '&:hover': {
        '& svg': {
          color: 'white',
        },
        backgroundColor: theme.palette.primary.main,
      },
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: 4,
      marginRight: 4,
      padding: 2,
    },
    '& .react-select__option': {
      '& svg': {
        marginTop: 2,
      },
      backgroundColor: theme.bg.white,
      color: theme.palette.text.primary,
      cursor: 'pointer',
      fontSize: '0.9rem',
      padding: '10px',
      [theme.breakpoints.only('xs')]: {
        fontSize: '1rem',
      },
      transition: theme.transitions.create(['background-color', 'color']),
    },
    '& .react-select__option--is-disabled': {
      cursor: 'initial',
      opacity: 0.5,
    },
    '& .react-select__option--is-focused': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    '& .react-select__option--is-selected': {
      '&.react-select__option--is-focused': {
        backgroundColor: theme.bg.white,
      },
      color: theme.palette.primary.main,
    },
    '& .react-select__single-value': {
      color: theme.palette.text.primary,
      overflow: 'hidden',
      padding: `$theme.spacing(1) 0`,
    },
    '& .react-select__value-container': {
      '& > div': {
        width: '100%',
      },
      '&.react-select__value-container--is-multi': {
        '& > div, & .react-select__input': {
          width: 'auto',
        },
      },
      width: '100%',
    },
    '& [class*="MuiFormHelperText-error"]': {
      paddingBottom: theme.spacing(1),
    },
    position: 'relative',
    width: '100%',
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(1),
    width: '100%',
  },
  selectedMenuItem: {
    '& .tag': {
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      backgroundColor: theme.bg.lightBlue1,
      color: theme.palette.text.primary,
    },
    backgroundColor: `${theme.bg.main} !important`,
  },
  small: {
    minHeight: 35,
    minWidth: 'auto',
  },
  source: {
    color: theme.color.headline,
    margin: 0,
    marginTop: `calc(${theme.spacing(1)} / 4)`,
    paddingLeft: theme.spacing(1),
  },
  suggestionDescription: {
    color: theme.color.headline,
    fontSize: '.75rem',
    marginTop: 2,
  },
  suggestionIcon: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginLeft: theme.spacing(1.5),
  },
  suggestionItem: {
    padding: theme.spacing(),
  },
  suggestionRoot: {
    '&:last-child': {
      borderBottom: 0,
    },
    alignItems: 'space-between',
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    justifyContent: 'space-between',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
    width: 'calc(100% + 2px)',
  },
  suggestionTitle: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 600,
    wordBreak: 'break-all',
  },
  tagContainer: {
    '& > div': {
      margin: '2px',
    },
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
}));

// @todo @tdt: Replace the class name based styles above with these. They're (mostly) copied over,
// as they're needed for one specific case: where a Select component appears on a Dialog. To reduce
// duplication, we can use these styles only by providing the result of this function as the styles
// prop on the Select component in ./Select.tsx.
//
// We'll need extensive regression testing on existing Selects before removing the classes.
export const reactSelectStyles = (theme: Theme) => ({
  clearIndicator: (base: any) => ({
    ...base,
    '& svg': {
      '&:hover': {
        color: theme.palette.primary.main,
      },
      color: theme.color.grey4,
    },
    padding: theme.spacing(1),
  }),
  control: (base: any) => ({
    ...base,
    '&:hover': {
      border: `1px dotted #ccc`,
      cursor: 'text',
    },
    '&--is-focused, &--is-focused:hover': {
      border: `1px dotted #999`,
    },
    backgroundColor: theme.bg.white,
    border: `1px solid transparent`,
    borderRadius: 0,
    boxShadow: 'none',
    minHeight: `calc(${theme.spacing(5)} - 2)`,
  }),
  group: (base: any) => ({
    ...base,
    '&:last-child': {
      paddingBottom: 0,
    },
    width: `calc(100% + calc(${theme.spacing(1)} / 2))`,
  }),
  groupHeading: (base: any) => ({
    ...base,
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    paddingLeft: 10,
    paddingRight: 10,
    textTransform: 'initial',
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    display: 'none',
  }),
  input: (base: any) => ({
    ...base,
    color: theme.palette.text.primary,
    width: '100%',
  }),
  menu: (base: any) => ({
    ...base,
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    boxShadow: 'none',
    left: -1,
    margin: 0,
    maxWidth: 415,
    top: 8,
    // The following three rules are different than the class above:
    width: '101%',
    zIndex: 100,
  }),
  menuList: (base: any) => ({
    ...base,
    '&::-webkit-scrollbar': {
      appearance: 'none',
    },
    '&::-webkit-scrollbar:vertical': {
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#ccc',
      borderRadius: 8,
    },
    backgroundColor: theme.bg.white,
    maxHeight: 285,
    minHeight: '101%',
    overflow: 'auto',
    padding: theme.spacing(0.5),
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  multiValue: (base: any) => ({
    ...base,
    alignItems: 'center',
    backgroundColor: theme.bg.lightBlue1,
    borderRadius: 4,
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    '& svg': {
      color: theme.palette.text.primary,
      height: 12,
      width: 12,
    },
    '&:hover': {
      '& svg': {
        color: 'white',
      },
      backgroundColor: theme.palette.primary.main,
    },
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 4,
    padding: 2,
  }),
  option: (base: any, state: any) => {
    const optionStyles = {
      ...base,
      backgroundColor: theme.bg.white,
      color: theme.palette.text.primary,
      cursor: 'pointer',
      fontSize: '0.9rem',
      padding: '10px',
      [theme.breakpoints.only('xs')]: {
        fontSize: '1.0rem',
      },
      transition: theme.transitions.create(['background-color', 'color']),
    };

    if (state.isFocused) {
      return {
        ...optionStyles,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      };
    }
    if (state.isSelected) {
      return {
        ...optionStyles,
        backgroundColor: theme.bg.white,
        color: theme.palette.primary.main,
      };
    }
    if (state.isDisabled) {
      return {
        ...optionStyles,
        cursor: 'initial',
        opacity: 0.5,
      };
    }
    return optionStyles;
  },
  singleValue: (base: any) => ({
    ...base,
    color: theme.palette.text.primary,
    overflow: 'hidden',
  }),
  valueContainer: (base: any) => ({
    ...base,
    '& > div': {
      width: '100%',
    },
    '&.react-select__value-container--is-multi': {
      '& > div, & .react-select__input': {
        width: 'auto',
      },
    },
    width: '100%',
  }),
});
