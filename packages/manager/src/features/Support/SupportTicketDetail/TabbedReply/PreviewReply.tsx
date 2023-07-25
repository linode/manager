import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Paper } from 'src/components/Paper';

type ClassNames = 'root';

const styles = () =>
  createStyles({
    root: {
      border: '1px solid #ccc',
      height: 320,
      overflowY: 'auto',
      padding: `9px 12px 9px 12px`,
    },
  });

interface Props {
  error?: string;
  value: string;
}

type CombinedProps = WithStyles<ClassNames> & Props;

const PreviewReply: React.FC<CombinedProps> = (props) => {
  const { classes, error, value } = props;

  return (
    <Paper className={classes.root} error={error}>
      <HighlightedMarkdown textOrMarkdown={value} />
    </Paper>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(React.memo, styled)(PreviewReply);
