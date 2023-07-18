import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { Tab, TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';

import Preview from './PreviewReply';
import Reply, { Props as ReplyProps } from './TicketReply';

interface Props {
  innerClass?: string;
  isReply?: boolean;
  required?: boolean;
  rootClass?: string;
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
        return <Reply {...rest} error={error} value={value} />;
      },
      title: props.required ? `${title} (required)` : title,
    },
    {
      render: () => {
        return <Preview error={error} value={value} />;
      },
      title: 'Preview',
    },
  ];

  return (
    <TabbedPanel
      header=""
      innerClass={innerClass}
      noPadding
      rootClass={rootClass || classes.root}
      tabs={tabs}
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
