import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
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

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class Tag extends React.Component<PropsWithStyles, {}> {
  static defaultProps = {
    colorVariant: 'gray' as Variants,
  };

  render() {
    const {
      colorVariant,
      classes,
      className,
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
      data-qa-tag={this.props.label}
      component="div"
      role="term"
    />;
  }
};

const styled = withStyles(styles);

export default styled(Tag);
