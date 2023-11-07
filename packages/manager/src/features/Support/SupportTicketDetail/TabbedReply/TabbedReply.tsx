import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Tab, TabbedPanel } from 'src/components/TabbedPanel/TabbedPanel';

import { PreviewReply } from './PreviewReply';
import { Props as ReplyProps, TicketReply } from './TicketReply';

interface Props extends ReplyProps {
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

export const TabbedReply = (props: Props) => {
  const classes = useStyles();
  const { error, innerClass, rootClass, value, ...rest } = props;

  const title = props.isReply ? 'Reply' : 'Description';

  const tabs: Tab[] = [
    {
      render: () => {
        return <TicketReply {...rest} error={error} value={value} />;
      },
      title: props.required ? `${title} (required)` : title,
    },
    {
      render: () => {
        return <PreviewReply error={error} value={value} />;
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
