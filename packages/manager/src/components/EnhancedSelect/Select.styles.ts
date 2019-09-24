import { createStyles, Theme } from 'src/components/core/styles';

export type ClassNames =
  | 'root'
  | 'input'
  | 'noOptionsMessage'
  | 'divider'
  | 'suggestionRoot'
  | 'highlight'
  | 'suggestionItem'
  | 'suggestionTitle'
  | 'suggestionDescription'
  | 'resultContainer'
  | 'tagContainer'
  | 'selectedMenuItem'
  | 'medium'
  | 'small'
  | 'noMarginTop'
  | 'inline'
  | 'hideLabel'
  | 'algoliaRoot'
  | 'label'
  | 'source'
  | 'icon'
  | 'row'
  | 'finalLink';

export const styles = (theme: Theme) =>
  createStyles({
    '@keyframes dash': {
      to: {
        'stroke-dashoffset': 0
      }
    },
    root: {
      width: '100%',
      position: 'relative',
      '& .react-select__control': {
        borderRadius: 0,
        boxShadow: 'none',
        border: `1px solid transparent`,
        backgroundColor: theme.bg.white,
        minHeight: theme.spacing(5) - 2,
        '&:hover': {
          border: `1px dotted #ccc`,
          cursor: 'text'
        },
        '&--is-focused, &--is-focused:hover': {
          border: `1px dotted #999`
        }
      },
      '& .react-select__value-container': {
        width: '100%',
        '& > div': {
          width: '100%'
        },
        '&.react-select__value-container--is-multi': {
          '& > div, & .react-select__input': {
            width: 'auto'
          }
        }
      },
      '& .react-select__input': {
        width: '100%',
        color: theme.palette.text.primary
      },
      '& .react-select__menu': {
        margin: '-1px 0 0 0',
        borderRadius: 0,
        boxShadow: 'none',
        border: `1px solid ${theme.color.selectDropDowns}`,
        maxWidth: 415,
        zIndex: 100
      },
      '& .react-select__group': {
        width: `calc(100% + ${theme.spacing(1) / 2}px)`,
        '&:last-child': {
          paddingBottom: 0
        }
      },
      '& .react-select__group-heading': {
        textTransform: 'initial',
        fontSize: '1rem',
        color: theme.color.headline,
        fontFamily: theme.font.bold,
        paddingLeft: 10,
        paddingRight: 10
      },
      '& .react-select__menu-list': {
        padding: theme.spacing(1) / 2,
        backgroundColor: theme.bg.white,
        height: '101%',
        overflow: 'auto',
        maxHeight: 285,
        '&::-webkit-scrollbar': {
          appearance: 'none'
        },
        '&::-webkit-scrollbar:vertical': {
          width: 8
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: '#ccc'
        }
      },
      '& .react-select__option': {
        transition: theme.transitions.create(['background-color', 'color']),
        color: theme.palette.text.primary,
        backgroundColor: theme.bg.white,
        cursor: 'pointer',
        padding: '10px',
        fontSize: '0.9rem'
      },
      '& .react-select__option--is-focused': {
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      },
      '& .react-select__option--is-selected': {
        color: theme.palette.primary.main,
        '&.react-select__option--is-focused': {
          backgroundColor: theme.bg.white
        }
      },
      '& .react-select__option--is-disabled': {
        opacity: 0.5,
        cursor: 'initial'
      },
      '& .react-select__single-value': {
        color: theme.palette.text.primary,
        overflow: 'hidden'
      },
      '& .react-select__indicator-separator': {
        display: 'none'
      },
      '& .react-select__multi-value': {
        borderRadius: 4,
        backgroundColor: theme.bg.lightBlue,
        alignItems: 'center'
      },
      '& .react-select__multi-value__label': {
        color: theme.palette.text.primary,
        fontSize: '.8rem',
        height: 20,
        marginTop: 2,
        marginBottom: 2,
        marginRight: 4,
        paddingLeft: 6,
        paddingRight: 0
      },
      '& .react-select__clear-indicator': {
        padding: theme.spacing(1),
        '& svg': {
          color: theme.color.grey4,
          '&:hover': {
            color: theme.palette.primary.main
          }
        }
      },
      '& .react-select__multi-value__remove': {
        backgroundColor: 'transparent',
        borderRadius: '50%',
        padding: 2,
        marginLeft: 4,
        marginRight: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          color: theme.palette.text.primary,
          width: 12,
          height: 12
        },
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          '& svg': {
            color: 'white'
          }
        }
      },
      '& .react-select__dropdown-indicator': {},
      '& [class*="MuiFormHelperText-error"]': {
        paddingBottom: theme.spacing(1)
      }
    },
    input: {
      fontSize: '0.9rem',
      padding: 0,
      display: 'flex',
      color: theme.palette.text.primary,
      cursor: 'pointer'
    },
    noOptionsMessage: {
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
    },
    divider: {
      height: theme.spacing(2)
    },
    suggestionRoot: {
      cursor: 'pointer',
      width: 'calc(100% + 2px)',
      alignItems: 'space-between',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.palette.divider}`,
      [theme.breakpoints.up('md')]: {
        display: 'flex'
      },
      '&:last-child': {
        borderBottom: 0
      }
    },
    highlight: {
      color: theme.palette.primary.main
    },
    suggestionItem: {
      padding: theme.spacing(1)
    },
    suggestionTitle: {
      fontSize: '1rem',
      color: theme.palette.text.primary,
      wordBreak: 'break-all'
    },
    suggestionDescription: {
      color: theme.color.headline,
      fontSize: '.75rem',
      fontWeight: 600,
      marginTop: 2
    },
    resultContainer: {
      display: 'flex',
      flexFlow: 'row nowrap'
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: 8,
      justifyContent: 'flex-end',
      alignItems: 'center',
      '& > div': {
        margin: '2px'
      }
    },
    selectedMenuItem: {
      backgroundColor: `${theme.bg.main} !important`,
      '& .tag': {
        backgroundColor: theme.bg.lightBlue,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }
      }
    },
    medium: {
      minHeight: 40
    },
    small: {
      minHeight: 35,
      minWidth: 'auto'
    },
    noMarginTop: {
      marginTop: 0
    },
    inline: {
      display: 'inline-flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& label': {
        marginRight: theme.spacing(1),
        whiteSpace: 'nowrap',
        position: 'relative',
        top: 1
      }
    },
    hideLabel: {
      '& label': { ...theme.visually.hidden }
    },
    algoliaRoot: {
      width: '100%',
      cursor: 'pointer',
      padding: theme.spacing(1) / 2 + 2,
      '& em': {
        fontStyle: 'normal',
        color: theme.color.blueDTwhite
      }
    },
    label: {
      display: 'inline',
      color: theme.palette.text.primary,
      maxWidth: '95%'
    },
    icon: {
      display: 'inline-block',
      width: 12,
      height: 12,
      position: 'relative',
      top: 5,
      marginLeft: theme.spacing(1) / 2,
      marginRight: theme.spacing(1) / 2,
      color: theme.palette.primary.main
    },
    source: {
      marginTop: theme.spacing(1) / 4,
      color: theme.color.headline,
      paddingLeft: theme.spacing(1),
      margin: 0
    },
    row: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(1)
    },
    finalLink: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '1.2em',
      paddingLeft: theme.spacing(1)
    }
  });
