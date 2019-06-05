import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid #ccc',
      height: 200,
      padding: `9px 12px 9px 12px`,
      overflowY: 'auto'
    }
  });

interface Props {
  value: string;
  error?: string;
}

type CombinedProps = WithStyles<ClassNames> & Props;

const PreviewReply: React.FC<CombinedProps> = props => {
  const { classes, value, error } = props;

  const markupToMarkdown = new Converter({
    extensions: ['highlightjs'],
    simplifiedAutoLink: true,
    openLinksInNewWindow: true
  }).makeHtml(value);

  return (
    <Paper className={classes.root} error={error}>
      <Typography
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(markupToMarkdown)
        }}
      />
    </Paper>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(PreviewReply);
