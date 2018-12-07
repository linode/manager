import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Chip, { ChipProps } from 'src/components/core/Chip';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type Variants =
  'white'
  | 'gray'
  | 'lightGray'
  | 'blue'
  | 'lightBlue'
  | 'green'
  | 'lightGreen'
  | 'yellow'
  | 'lightYellow';

type CSSClasses = 'label' | 'root' | Variants;

const styles: StyleRulesCallback<CSSClasses> = (theme) => {
  return ({
    label: {},
    root: {},
    white: {
      backgroundColor: theme.color.white,
      '&:focus': {
        backgroundColor: theme.color.white,
      },
    },
    gray: {
      backgroundColor: '#939598',
      color: 'white',
      '&:focus': {
        backgroundColor: '#939598',
      },
    },
    lightGray: {
      backgroundColor: '#C9CACB',
      color: 'white',
      '&:focus': {
        backgroundColor: '#C9CACB',
      },
    },
    blue: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    lightBlue: {
      backgroundColor: theme.bg.lightBlue,
      '&:focus': {
        backgroundColor: theme.bg.lightBlue,
      },
    },
    green: {
      backgroundColor: '#61CD7B',
      color: 'white',
      '&:focus': {
        backgroundColor: '#61CD7B',
      },
    },
    lightGreen: {
      backgroundColor: '#DFF3E7',
      '&:focus': {
        backgroundColor: '#DFF3E7',
      },
    },
    yellow: {
      backgroundColor: '#F8D147',
      '&:focus': {
        backgroundColor: '#F8D147',
      },
    },
    lightYellow: {
      backgroundColor: '#FCF4DD',
      '&:focus': {
        backgroundColor: '#FCF4DD',
      },
    },
  });
};

export interface Props extends ChipProps {
  label: string;
  colorVariant?: Variants;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<CSSClasses>;

class Tag extends React.Component<CombinedProps, {}> {
  static defaultProps = {
    colorVariant: 'gray' as Variants,
  };

  handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    const { history, label } = this.props;
    history.push(`/search/?query=${label}`);
  }

  render() {
    const {
      colorVariant,
      classes,
      className,
      history, location, staticContext, match, // Don't pass route props to the Chip component
      ...chipProps
    } = this.props;

    return <Chip
      {...chipProps}
      className={classNames({
        ...(className && { [className]: true }),
        [classes[colorVariant!]]: true,
        [classes.root]: true,
      })}
      deleteIcon={this.props.deleteIcon || <Close />}
      classes={{ label: classes.label, deletable: classes[colorVariant!]}}
      onClick={this.handleClick}
      data-qa-tag={this.props.label}
      component="button"
      role="term"
    />;
  }
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRouter,
)(Tag)

export default enhanced;
