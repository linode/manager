import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';

type ClassNames = 'root';

const styles = () =>
  createStyles({
    root: {
      border: '1px solid #ccc',
      height: 320,
      padding: `9px 12px 9px 12px`,
      overflowY: 'auto',
    },
  });

interface Props {
  value: string;
  error?: string;
}

type CombinedProps = WithStyles<ClassNames> & Props;

const PreviewReply: React.FC<CombinedProps> = (props) => {
  const { classes, value, error } = props;

  return (
    <Paper className={classes.root} error={error}>
      <HighlightedMarkdown textOrMarkdown={value} />
    </Paper>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(React.memo, styled)(PreviewReply);
