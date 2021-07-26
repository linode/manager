import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import TabbedPanel, { Tab } from 'src/components/TabbedPanel';
import Preview from './PreviewReply';
import Reply, { Props as ReplyProps } from './TicketReply';

interface Props {
  rootClass?: string;
  innerClass?: string;
  isReply?: boolean;
  required?: boolean;
}

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent',
    paddingRight: 0,
    paddingLeft: 0,
  },
}));

type CombinedProps = Props & ReplyProps;

const TabbedReply: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { innerClass, rootClass, value, error, ...rest } = props;

  const title = props.isReply ? 'Reply' : 'Description';

  const tabs: Tab[] = [
    {
      title: props.required ? `${title} (required)` : title,
      render: () => {
        return <Reply {...rest} value={value} error={error} />;
      },
    },
    {
      title: 'Preview',
      render: () => {
        return <Preview value={value} error={error} />;
      },
    },
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

/** only update on error and value change */
const memoized = (component: React.FC<CombinedProps>) =>
  React.memo<CombinedProps>(component, (prevProps, nextProps) => {
    return (
      prevProps.error === nextProps.error &&
      prevProps.value === nextProps.value &&
      prevProps.innerClass === nextProps.innerClass
    );
  });

export default compose<CombinedProps, ReplyProps & Props>(memoized)(
  TabbedReply
);
