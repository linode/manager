import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';

import Paper from 'src/components/core/Paper';

// import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    border: '1px solid #ccc',
    minHeight: '140px',
    marginTop: theme.spacing.unit * 2,
    padding: `9px 12px 9px 12px`
  }
});

interface Props {
  value: string;
}

type CombinedProps = WithStyles<ClassNames> & Props;

const PreviewReply: React.FC<CombinedProps> = props => {
  const { classes, value } = props;

  const markupToMarkdown = new Converter({
    extensions: ['highlightjs']
  }).makeHtml(value);

  return (
    <Paper
      className={classes.root}
      dangerouslySetInnerHTML={{
        __html: markupToMarkdown
      }}
    />
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(PreviewReply);
