import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TabbedPanel, { Tab } from 'src/components/TabbedPanel';
import Preview from './PreviewReply';
import Reply, { Props as ReplyProps } from './TicketReply';

type ClassNames = 'root';

interface Props {
  rootClass?: string;
  innerClass?: string;
  isReply?: boolean;
  required?: boolean;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: 'transparent'
    }
  });

type CombinedProps = Props & ReplyProps & WithStyles<ClassNames>;

const TabbedReply: React.FC<CombinedProps> = props => {
  const { innerClass, rootClass, classes, value, error, ...rest } = props;

  const title = props.isReply ? 'Reply' : 'Description';

  const tabs: Tab[] = [
    {
      title: props.required ? `${title} (required)` : title,
      render: () => {
        return <Reply {...rest} value={value} error={error} />;
      },
      name: title
    },
    {
      title: 'Preview',
      render: () => {
        return <Preview value={value} error={error} />;
      },
      name: 'preview'
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
      prevProps.error === nextProps.error &&
      prevProps.value === nextProps.value &&
      prevProps.innerClass === nextProps.innerClass
    );
  });

export default compose<CombinedProps, ReplyProps & Props>(
  memoized,
  styled
)(TabbedReply);
