import { WithStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/core/Button';
import Chip, { ChipProps } from 'src/components/core/Chip';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

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

const styles: StyleRulesCallback<CSSClasses> = theme => {
  return {
    label: {},
    root: {},
    deleteButton: {
      minWidth: 'auto'
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
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue,
        color: theme.color.black
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
  };
};

export interface Props extends ChipProps {
  label: string;
  colorVariant?: Variants;
  asSuggestion?: boolean;
  closeMenu?: any;
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
            <Button data-qa-delete-tag className={classes.deleteButton}>
              <Close />
            </Button>
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
      />
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRouter
)(Tag);

export default enhanced;
