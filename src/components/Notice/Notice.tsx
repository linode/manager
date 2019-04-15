import * as classNames from 'classnames';
import * as React from 'react';
import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Flag from 'src/assets/icons/flag.svg';
import Warning from 'src/assets/icons/warning.svg';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid, { GridProps } from 'src/components/Grid';

type ClassNames =
  | 'root'
  | 'important'
  | 'inner'
  | 'noticeText'
  | 'error'
  | 'errorList'
  | 'warning'
  | 'warningList'
  | 'success'
  | 'successList'
  | 'flag'
  | 'breakWords'
  | 'icon';

const styles: StyleRulesCallback = theme => {
  const {
    palette: { status }
  } = theme;

  return {
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      marginBottom: theme.spacing.unit * 2,
      padding: '4px 16px',
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      '& + .notice': {
        marginTop: `${theme.spacing.unit}px !important`
      }
    },
    important: {
      backgroundColor: theme.bg.white,
      padding: theme.spacing.unit * 2,
      '& $noticeText': {
        fontFamily: theme.font.normal
      }
    },
    inner: {
      width: '100%'
    },
    breakWords: {
      '& $noticeText': {
        wordBreak: 'break-all'
      }
    },
    noticeText: {
      color: theme.palette.text.primary,
      fontSize: '1rem',
      lineHeight: 1.2,
      fontFamily: 'LatoWebBold' // we keep this bold at all times
    },
    error: {
      borderLeft: `5px solid ${status.errorDark}`,
      animation: 'fadeIn 225ms linear forwards',
      '&$important': {
        borderLeftWidth: 26
      }
    },
    errorList: {
      borderLeft: `5px solid ${status.errorDark}`
    },
    warning: {
      borderLeft: `5px solid ${status.warningDark}`,
      animation: 'fadeIn 225ms linear forwards',
      '&$important': {
        borderLeftWidth: 26
      }
    },
    warningList: {
      borderLeft: `5px solid ${status.warningDark}`
    },
    success: {
      borderLeft: `5px solid ${status.successDark}`,
      animation: 'fadeIn 225ms linear forwards',
      '&$important': {
        borderLeftWidth: 26
      }
    },
    successList: {
      borderLeft: `5px solid ${status.successDark}`
    },
    flag: {
      marginRight: theme.spacing.unit * 2
    },
    icon: {
      color: 'white',
      marginLeft: -(theme.spacing.unit * 2 + 22),
      marginRight: 18
    }
  };
};

interface Props extends GridProps {
  text?: string;
  html?: string;
  error?: boolean;
  errorGroup?: string;
  important?: boolean;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  flag?: boolean;
  notificationList?: boolean;
  spacingTop?: 0 | 8 | 16 | 24;
  spacingBottom?: 0 | 8 | 16 | 24;
  breakWords?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Notice: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    className,
    important,
    text,
    error,
    breakWords,
    errorGroup,
    warning,
    success,
    typeProps,
    children,
    flag,
    html,
    notificationList,
    onClick,
    spacingTop,
    spacingBottom
  } = props;

  const c = html ? (
    <Typography {...typeProps} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <Typography
      {...typeProps}
      component="div"
      onClick={onClick}
      className={`${classes.noticeText} noticeText`}
    >
      {text && text}
      {children && children}
    </Typography>
  );

  const errorScrollClassName = errorGroup
    ? `error-for-scroll-${errorGroup}`
    : `error-for-scroll`;

  const dataAttributes = !props.error
    ? {
        'data-qa-notice': true
      }
    : {
        'data-qa-notice': true,
        'data-qa-error': true
      };

  return (
    <Grid
      item
      className={classNames({
        [classes.root]: true,
        [classes.important]: important,
        [errorScrollClassName]: error,
        [classes.breakWords]: breakWords,
        [classes.error]: error && !notificationList,
        [classes.errorList]: error && notificationList,
        [classes.success]: success && !notificationList,
        [classes.successList]: success && notificationList,
        [classes.warning]: warning && !notificationList,
        [classes.warningList]: warning && notificationList,
        notice: true,
        ...(className && { [className]: true })
      })}
      style={{
        marginTop: spacingTop !== undefined ? spacingTop : 0,
        marginBottom: spacingBottom !== undefined ? spacingBottom : 24
      }}
      {...dataAttributes}
    >
      {flag && (
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      )}
      {important &&
        ((success && <Check className={classes.icon} />) ||
          (warning && <Warning className={classes.icon} />) ||
          (error && <Error className={classes.icon} />))}
      <div className={classes.inner}>{c}</div>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(Notice);
