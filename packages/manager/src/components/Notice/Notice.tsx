import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import * as React from 'react';
import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Flag from 'src/assets/icons/flag.svg';
import Warning from 'src/assets/icons/warning.svg';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid, { GridProps } from 'src/components/Grid';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    padding: '4px 16px',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    '& + .notice': {
      marginTop: `${theme.spacing(1)}px !important`
    }
  },
  cmr: {
    borderRadius: 3,
    '& $important': {
      backgroundColor: theme.cmrBGColors.bgPaper
    },
    '& $noticeText': {
      color: theme.cmrTextColors.headlineStatic
    },
    '& $error': {
      borderLeftColor: theme.cmrIconColors.iRed
    }
  },
  important: {
    backgroundColor: theme.bg.white,
    padding: theme.spacing(2),
    '& $noticeText': {
      fontFamily: theme.font.normal
    }
  },
  icon: {
    color: 'white',
    position: 'absolute',
    left: -25 // This value must be static regardless of theme selection
  },
  closeIcon: {
    paddingLeft: theme.spacing(1)
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
    lineHeight: `20px`,
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    '& p': {
      fontSize: '1rem'
    }
  },
  error: {
    borderLeft: `5px solid ${theme.palette.status.errorDark}`,
    animation: '$fadeIn 225ms linear forwards',
    '&$important': {
      borderLeftWidth: 32
    }
  },
  errorList: {
    borderLeft: `5px solid ${theme.palette.status.errorDark}`
  },
  warning: {
    borderLeft: `5px solid ${theme.palette.status.warningDark}`,
    animation: '$fadeIn 225ms linear forwards',
    '&$important': {
      borderLeftWidth: 32
    },
    '& $icon': {
      color: '#555'
    }
  },
  warningList: {
    borderLeft: `5px solid ${theme.palette.status.warningDark}`
  },
  success: {
    borderLeft: `5px solid ${theme.palette.status.successDark}`,
    animation: '$fadeIn 225ms linear forwards',
    '&$important': {
      borderLeftWidth: 32
    }
  },
  successList: {
    borderLeft: `5px solid ${theme.palette.status.successDark}`
  },
  flag: {
    marginRight: theme.spacing(2)
  }
}));

interface Props extends GridProps {
  text?: string | JSX.Element;
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
  // Dismissible Props
  dismissible?: boolean;
  onClose?: () => void;
}

type CombinedProps = Props & WithTheme;

const Notice: React.FC<CombinedProps> = props => {
  const {
    className,
    important,
    text,
    dismissible,
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
    onClose,
    spacingTop,
    spacingBottom
  } = props;

  const classes = useStyles();
  const flags = useFlags();

  const c = html ? (
    <Typography
      {...typeProps}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  ) : (
    <Typography
      {...typeProps}
      component="div"
      onClick={onClick}
      className={`${classes.noticeText} noticeText`}
    >
      {Boolean(text) && text}
      {Boolean(children) && children}
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
        [classes.cmr]: Boolean(flags.cmr),
        notice: true,
        ...(className && { [className]: true })
      })}
      style={{
        marginTop: spacingTop !== undefined ? spacingTop : 0,
        marginBottom: spacingBottom !== undefined ? spacingBottom : 24
      }}
      {...dataAttributes}
      role="alert"
    >
      {flag && (
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      )}
      {important &&
        ((success && <Check className={classes.icon} data-qa-success-img />) ||
          (warning && (
            <Warning className={classes.icon} data-qa-warning-img />
          )) ||
          (error && <Error className={classes.icon} data-qa-error-img />))}
      <div className={classes.inner}>{c}</div>
      {dismissible && (
        <Grid item className={classes.closeIcon}>
          <Close
            style={{
              cursor: 'pointer'
            }}
            onClick={onClose}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default withTheme(Notice);
