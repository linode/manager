import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Chip, { ChipProps } from 'src/components/core/Chip';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import { truncateEnd } from 'src/utilities/truncate';

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
    label: {
      maxWidth: 350,
    },
    root: {
      height: 30,
      paddingLeft: 0,
      paddingRight: 0,
      // Overrides MUI chip default styles so these appear as separate elements.
      '&:hover': {
        backgroundColor: theme.color.tagButton,
        '& $deleteButton': {
          color: theme.color.tagIcon,
        },
      },
      '&:focus': {
        backgroundColor: theme.color.tagButton,
        '& $deleteButton': {
          color: theme.color.tagIcon,
        },
      },
      // Targets first span (tag label)
      '& > span': {
        padding: '7px 10px',
        fontSize: 14,
        color: theme.color.tagText,
        borderRadius: 3,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderRight: `1px solid ${theme.color.tagBorder}`,
      },
    },
    deleteButton: {
      ...theme.applyLinkStyles,
      borderRadius: 0,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
      height: 30,
      minWidth: 30,
      margin: 0,
      padding: theme.spacing(),
      '& svg': {
        borderRadius: 0,
        width: 15,
        height: 15,
        color: theme.color.tagIcon,
      },
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: 'white !important',
        '& svg': {
          color: 'white',
        },
      },
      '&:focus': {
        backgroundColor: theme.bg.lightBlue,
        color: theme.color.black,
      },
    },
    white: {
      backgroundColor: theme.color.white,
      '&:hover': {
        backgroundColor: theme.color.white,
      },
    },
    gray: {
      backgroundColor: '#939598',
      color: 'white',
      '&:hover': {
        backgroundColor: '#939598',
      },
    },
    lightGray: {
      backgroundColor: '#C9CACB',
      color: 'white',
      '&:hover': {
        backgroundColor: '#C9CACB',
      },
    },
    blue: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    lightBlue: {
      backgroundColor: theme.color.tagButton,
      '& > span': {
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
        '&:focus': {
          backgroundColor: theme.color.tagButton,
          color: theme.color.black,
        },
      },
    },
    green: {
      backgroundColor: '#61CD7B',
      color: 'white',
      '&:hover': {
        backgroundColor: '#61CD7B',
      },
    },
    lightGreen: {
      backgroundColor: '#DFF3E7',
      '&:hover': {
        backgroundColor: '#DFF3E7',
      },
    },
    yellow: {
      backgroundColor: '#F8D147',
      '&:hover': {
        backgroundColor: '#F8D147',
      },
    },
    lightYellow: {
      backgroundColor: '#FCF4DD',
      '&:hover': {
        backgroundColor: '#FCF4DD',
      },
    },
  });

export interface Props extends ChipProps {
  label: string;
  colorVariant?: Variants;
  asSuggestion?: boolean;
  closeMenu?: any;
  component?: string;
  maxLength?: number;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<CSSClasses>;

class Tag extends React.Component<CombinedProps, {}> {
  static defaultProps = {
    colorVariant: 'gray' as Variants,
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
      label,
      maxLength,
      // Defining `staticContext` here to prevent `...rest` from containing it
      // since it leads to a console warning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      staticContext,
      ...chipProps
    } = this.props;

    // If maxWidth is set, truncate display to that length.
    const _label = maxLength ? truncateEnd(label, maxLength) : label;

    return (
      <Chip
        {...chipProps}
        label={_label}
        className={classNames({
          ...(className && { [className]: true }),
          [classes[colorVariant!]]: true,
          [classes.root]: true,
        })}
        deleteIcon={
          chipProps.onDelete ? (
            <button
              data-qa-delete-tag
              className={classes.deleteButton}
              title="Delete tag"
              aria-label={`Delete Tag "${this.props.label}"`}
            >
              <Close />
            </button>
          ) : undefined
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
