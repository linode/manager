import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/core/Button';
import Chip, { ChipProps } from 'src/components/core/Chip';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type Variants =
  | 'white'
  | 'gray'
  | 'lightGray'
  | 'blue'
  | 'lightBlue'
  | 'green'
  | 'lightGreen'
  | 'yellow'
  | 'lightYellow';

type CSSClasses = 'label' | 'root' | 'deleteButton' | Variants;

const styles = (theme: Theme) =>
  createStyles({
    label: {},
    root: {
      height: 30,
      paddingLeft: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: theme.bg.lightBlue
      },
      '& > span': {
        padding: '7px 10px',
        fontSize: 14,
        color: '#3a3f46',
        borderRadius: 3,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRight: '1px solid white'
      },
      '&:last-child': {
        marginRight: 8
      }
    },
    deleteButton: {
      ...theme.applyLinkStyles,
      margin: 0,
      width: 30,
      height: 30,
      borderRadius: 0,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
      '& svg': {
        borderRadius: 0,
        width: 20,
        height: 20
      },
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: 'white !important'
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue,
        color: theme.color.black
      }
    },
    white: {
      backgroundColor: theme.color.white,
      '&:hover': {
        backgroundColor: theme.color.white
      }
    },
    gray: {
      backgroundColor: '#939598',
      color: 'white',
      '&:hover': {
        backgroundColor: '#939598'
      }
    },
    lightGray: {
      backgroundColor: '#C9CACB',
      color: 'white',
      '&:hover': {
        backgroundColor: '#C9CACB'
      }
    },
    blue: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main
      }
    },
    lightBlue: {
      backgroundColor: theme.bg.lightBlue,
      '& > span': {
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        },
        '&:focus': {
          backgroundColor: theme.bg.lightBlue,
          color: theme.color.black
        }
      }
    },
    green: {
      backgroundColor: '#61CD7B',
      color: 'white',
      '&:hover': {
        backgroundColor: '#61CD7B'
      }
    },
    lightGreen: {
      backgroundColor: '#DFF3E7',
      '&:hover': {
        backgroundColor: '#DFF3E7'
      }
    },
    yellow: {
      backgroundColor: '#F8D147',
      '&:hover': {
        backgroundColor: '#F8D147'
      }
    },
    lightYellow: {
      backgroundColor: '#FCF4DD',
      '&:hover': {
        backgroundColor: '#FCF4DD'
      }
    }
  });

export interface Props extends ChipProps {
  label: string;
  colorVariant?: Variants;
  asSuggestion?: boolean;
  closeMenu?: any;
  component?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<CSSClasses>;

class Tag extends React.Component<CombinedProps, {}> {
  static defaultProps = {
    colorVariant: 'gray' as Variants
  };

  handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.asSuggestion) {
      this.props.closeMenu();
    }
    const { history, label } = this.props;
    history.push(`/search/?query=tag:${label}`);
  };

  render() {
    const {
      colorVariant,
      classes,
      className,
      history,
      location,
      staticContext,
      match, // Don't pass route props to the Chip component
      asSuggestion,
      closeMenu,
      ...chipProps
    } = this.props;

    return (
      <Chip
        {...chipProps}
        className={classNames({
          ...(className && { [className]: true }),
          [classes[colorVariant!]]: true,
          [classes.root]: true
        })}
        deleteIcon={
          chipProps.onDelete ? (
            <button
              data-qa-delete-tag
              className={classes.deleteButton}
              aria-label={`Delete Tag "${this.props.label}"`}
            >
              <Close />
            </button>
          ) : (
            undefined
          )
        }
        classes={{ label: classes.label, deletable: classes[colorVariant!] }}
        onClick={this.handleClick}
        data-qa-tag={this.props.label}
        component="div"
        clickable
        role="button"
        aria-label={`Search for Tag "${this.props.label}"`}
      />
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled, withRouter)(Tag);

export default enhanced;
