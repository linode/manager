import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

import TabbedPanel from 'src/components/TabbedPanel';
import Reply, { Props as ReplyProps } from './TicketReply';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit,
    backgroundColor: 'transparent'
  }
});

type CombinedProps = ReplyProps & WithStyles<ClassNames>;

const TabbedReply: React.FC<CombinedProps> = props => {
  const { classes, ...rest } = props;

  const tabs = [
    {
      title: 'Reply',
      render: () => {
        return <Reply {...rest} />;
      }
    }
  ];

  return <TabbedPanel rootClass={classes.root} header="" tabs={tabs} />;
};

const styled = withStyles(styles);

export default compose<CombinedProps, ReplyProps>(
  styled,
  React.memo
)(TabbedReply);
