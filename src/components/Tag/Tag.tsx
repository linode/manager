import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';

type Variants =
  'primary'
  | 'light'
  | 'gray'
  | 'lightGray'
  | 'blue'
  | 'lightBlue'
  | 'green'
  | 'lightGreen'
  | 'yellow'
  | 'lightYellow'
  | 'white';

type CSSClasses = 'label' | 'root' | Variants;

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => {
  return ({
    label: {
      
    },
    root: {
      
    },
    primary: {},
    light: {},
    gray: {},
    lightGray: {},
    blue: {},
    lightBlue: {},
    green: {},
    lightGreen: {},
    yellow: {},
    lightYellow: {},
    white: {},
  });
};

interface Props {
  label: string;
  variant?: Variants;
  onDelete?: () => void;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

const Tag: React.SFC<PropsWithStyles> = (props) => {
  const { variant, classes, theme, ...rest } = props;
  const classNames = [
    props.classes[props.variant!],
    props.classes.root,
  ].join(' ');

  return <Chip
    className={classNames}
    classes={{ label: props.classes.label }}
    {...rest}
  />;
};

Tag.defaultProps = {
  variant: 'primary',
};

export default withStyles(styles, { withTheme: true })<Props>(Tag);
