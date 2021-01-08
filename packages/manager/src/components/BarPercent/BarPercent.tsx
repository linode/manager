import * as classNames from 'classnames';
import * as React from 'react';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme, useTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  root: {
    padding: 12,
    width: '100%',
    backgroundColor: theme.color.grey2,
    '&.narrow': {
      padding: 8
    }
  },
  primaryColor: {
    backgroundColor: '#5ad865'
  },
  secondaryColor: {
    backgroundColor: '#99ec79'
  },
  overLimit: {
    '& > div': {
      backgroundColor: theme.palette.status.warningDark
    }
  },
  rounded: {
    borderRadius: theme.shape.borderRadius
  },
  loadingText: {
    marginBottom: theme.spacing(2),
    textAlign: 'center'
  },
  dashed: {
    display: 'none'
  }
}));

interface Props {
  max: number;
  value: number;
  displayValueInline?: boolean;
  valueBuffer?: number;
  isFetchingValue?: boolean;
  loadingText?: string;
  className?: string;
  rounded?: boolean;
  overLimit?: boolean;
  narrow?: boolean;
}

type CombinedProps = Props;

export const BarPercent: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const {
    className,
    displayValueInline,
    value,
    valueBuffer,
    narrow,
    max,
    isFetchingValue,
    loadingText,
    rounded,
    overLimit
  } = props;
  return (
    <div className={`${className} ${classes.base}`}>
      {isFetchingValue && loadingText && (
        <Typography className={classes.loadingText} variant="h3">
          {loadingText}
        </Typography>
      )}
      <LinearProgress
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
        variant={
          isFetchingValue
            ? 'indeterminate'
            : valueBuffer
            ? 'buffer'
            : 'determinate'
        }
        classes={{
          root: classes.root,
          barColorPrimary: classes.primaryColor,
          bar2Buffer: classes.secondaryColor,
          dashed: classes.dashed
        }}
        className={classNames({
          [classes.rounded]: rounded,
          [classes.overLimit]: overLimit,
          narrow
        })}
      />
      {displayValueInline ? (
        <Typography
          style={{
            position: 'absolute',
            left: overLimit ? '25%' : `${Math.min(value + 4, 70)}%`,
            color: theme.palette.text.primary,
            fontSize: '14px'
          }}
        >
          {getInlineDisplayValue(value, overLimit)}
        </Typography>
      ) : null}
    </div>
  );
};

export const getInlineDisplayValue = (
  value: number,
  overLimit: boolean = false
) => {
  if (overLimit) {
    return 'Over quota';
  }
  return `${value > 1 ? Math.round(value) : value.toFixed(2)}%`;
};

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

export default React.memo(BarPercent);
