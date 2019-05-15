import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

import TabbedPanel, { Tab } from 'src/components/TabbedPanel';
import Preview from './PreviewReply';
import Reply, { Props as ReplyProps } from './TicketReply';

type ClassNames = 'root';

interface Props {
  rootClass?: string;
  innerClass?: string;
}

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit,
    backgroundColor: 'transparent'
  }
});

type CombinedProps = Props & ReplyProps & WithStyles<ClassNames>;

const TabbedReply: React.FC<CombinedProps> = props => {
  const { innerClass, rootClass, classes, value, error, ...rest } = props;

  const tabs: Tab[] = [
    {
      title: 'Reply',
      render: () => {
        return <Reply {...rest} value={value} error={error} />;
      }
    },
    {
      title: 'Preview',
      render: () => {
        return <Preview value={value} error={error} />;
      }
    }
  ];

  return (
    <TabbedPanel
      rootClass={rootClass || classes.root}
      header=""
      tabs={tabs}
      innerClass={innerClass}
      noPadding
    />
  );
};

const styled = withStyles(styles);

/** only update on error and value change */
const memoized = (component: React.FC<CombinedProps>) =>
  React.memo<CombinedProps>(component, (prevProps, nextProps) => {
    return (
      prevProps.error === nextProps.error && prevProps.value === nextProps.value
    );
  });

export default compose<CombinedProps, ReplyProps & Props>(
  memoized,
  styled
)(TabbedReply);
