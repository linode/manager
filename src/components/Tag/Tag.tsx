import * as React from 'react';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Close from 'material-ui-icons/Close';
import LinodeTheme from '../../../src/theme';

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

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => {
  return ({
    label: {

    },
    root: {

    },
    white: {
      backgroundColor: 'white',
    },
    gray: {
      backgroundColor: '#939598',
      color: 'white',
    },
    lightGray: {
      backgroundColor: '#C9CACB',
      color: 'white',
    },
    blue: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    lightBlue: {
      backgroundColor: LinodeTheme.bg.lightBlue,
    },
    green: {
      backgroundColor: '#61CD7B',
      color: 'white',
    },
    lightGreen: {
      backgroundColor: '#DFF3E7',
    },
    yellow: {
      backgroundColor: '#F8D147',
    },
    lightYellow: {
      backgroundColor: '#FCF4DD',
    },
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
    deleteIcon={<Close />}
    classes={{ label: props.classes.label }}
    data-qa-tag
    {...rest}
  />;
};

export default withStyles(styles, { withTheme: true })<Props>(Tag);
