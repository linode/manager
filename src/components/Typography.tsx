import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography'; 

type Variants =
  'display4'
  | 'display3'
  | 'display2'
  | 'display1'
  | 'headline'
  | 'title'
  | 'subheading'
  | 'body2'
  | 'body1'
  | 'caption'
  | 'button';

  type CSSClasses = 'root' | Variants;

const styles: StyleRulesCallback<CSSClasses> = (theme) => {
  return ({
    root: {
      fontFamily: '"LatoWeb", sans-serif',
      fontSize: 16,
    },
    display4: {
      fontSize: 12,
      [theme.breakpoints.up('md')]: {
        fontSize: 15
      },
    },
    display3: {},
    display2: {
      // color: primaryColors.text,
    },
    display1: {},
    headline: {
      // color: primaryColors.headline,
      fontSize: '1.5rem',
      fontFamily: 'LatoWebBold',
    },
    title: {
      // color: primaryColors.headline,
      fontSize: '1.125rem',
      fontFamily: 'LatoWebBold',
      lineHeight: '1.35417em',
    },
    subheading: {
      // color: primaryColors.headline,
      fontSize: '1rem',
      fontFamily: 'LatoWebBold',
      lineHeight: '1.2em',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '.78rem',
      lineHeight: '1.3em',
    },
    caption: {
      fontSize: '.9rem',
      lineHeight: '1.3em',
      // color: primaryColors.text,
    },
    button: {},
  });
};

export interface Props extends TypographyProps {
  variant?: Variants;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class LinodeTypography extends React.Component<PropsWithStyles, {}> {
  static defaultProps = {
    variant: 'body1' as Variants,
  };

  render() {
    const {
      variant,
      classes,
      theme,
      className,
      ...TypographyProps
    } = this.props;

    return <LinodeTypography
      {...TypographyProps}
      className={classNames({
        ...(className && { [className]: true }),
        [classes[variant!]]: true,
        [classes.root]: true,
      })}
    />;
  }
};

export default withStyles(styles, { withTheme: true })<Props>(LinodeTypography);
