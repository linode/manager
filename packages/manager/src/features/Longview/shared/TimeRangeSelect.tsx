import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

import { LongviewFieldName } from '../request';

import Select from 'src/components/EnhancedSelect/Select';

import withAccountSettings from 'src/containers/accountSettings.container';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props {
  lastUpdated: number;
  fields: LongviewFieldName[];
  clientAPIKey: string;
}

interface ReduxStateProps {
  isLongviewPro: boolean;
}

type CombinedProps = Props & ReduxStateProps;

const TimeRangeSelect: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const { children } = props;

  if (!children || typeof children !== 'function') {
    throw new Error(
      'TimeRangeSelect must have a children prop that is a function.'
    );
  }

  return <Select onChange={() => null}>{children('fdsaf')}</Select>;
};

export default compose<CombinedProps, Props>(
  React.memo,
  withAccountSettings<ReduxStateProps, Props>(
    (own, loading, lastUpdated, error, data) => {
      const subscription = (data || {}).longview_subscription;

      const isLongviewPro = !(subscription === 'longview-10' || !subscription);

      return {
        isLongviewPro
      };
    }
  )
)(TimeRangeSelect);
