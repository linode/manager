import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Tab, TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';
import Preview from './PreviewReply';
import Reply, { Props as ReplyProps } from './TicketReply';

interface Props {
  rootClass?: string;
  innerClass?: string;
  isReply?: boolean;
  required?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& div[role="tablist"]': {
      marginBottom: theme.spacing(),
      marginTop: theme.spacing(),
    },
    backgroundColor: 'transparent',
    padding: 0,
  },
}));

type CombinedProps = Props & ReplyProps;

const TabbedReply: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { error, innerClass, rootClass, value, ...rest } = props;

  const title = props.isReply ? 'Reply' : 'Description';

  const tabs: Tab[] = [
    {
      render: () => {
        return <Reply {...rest} value={value} error={error} />;
      },
      title: props.required ? `${title} (required)` : title,
    },
    {
      render: () => {
        return <Preview value={value} error={error} />;
      },
      title: 'Preview',
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
