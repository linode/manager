import classNames from 'classnames';
import * as React from 'react';
import LinearProgress from 'src/components/core/LinearProgress';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  base: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  root: {
    backgroundColor: theme.color.grey2,
    padding: 12,
    width: '100%',
    '&.narrow': {
      padding: 8,
    },
  },
  primaryColor: {
    backgroundColor: '#5ad865',
  },
  secondaryColor: {
    backgroundColor: '#99ec79',
  },
  rounded: {
    borderRadius: theme.shape.borderRadius,
  },
  dashed: {
    display: 'none',
  },
}));

interface Props {
  max: number;
  value: number;
  className?: string;
  valueBuffer?: number;
  isFetchingValue?: boolean;
  rounded?: boolean;
  narrow?: boolean;
}

type CombinedProps = Props;

export const BarPercent: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    max,
    value,
    className,
    valueBuffer,
    isFetchingValue,
    rounded,
    narrow,
  } = props;

  return (
    <div className={`${className} ${classes.base}`}>
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
          dashed: classes.dashed,
        }}
        className={classNames({
          [classes.rounded]: rounded,
          narrow,
        })}
      />
    </div>
  );
};

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

export default React.memo(BarPercent);
