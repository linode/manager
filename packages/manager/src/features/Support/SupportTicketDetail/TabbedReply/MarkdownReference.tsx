import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'header' | 'example';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    header: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1)
    },
    example: {
      backgroundColor: theme.bg.white,
      margin: `${theme.spacing(2)}px 0`,
      padding: theme.spacing(2)
      // border: `1px solid ${theme.color.border2}`
    }
  });

interface Props {
  rootClass?: string;
  isReply?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MarkdownReference: React.FC<CombinedProps> = props => {
  const { classes } = props;
  return (
    <div className={props.rootClass}>
      <Typography>
        You can use Markdown to format your{' '}
        {props.isReply ? 'reply' : 'question'}. For more examples see this
        <a
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
          href="http://demo.showdownjs.com/"
        >
          {' '}
          Markdown cheatsheet.
        </a>
      </Typography>
      <Typography className={classes.header}>
        <strong>Examples</strong>
      </Typography>
      <div className={classes.example}>
        <Typography>[I am a link](https://google.com)</Typography>
        <br />
        <Typography
          dangerouslySetInnerHTML={{
            __html: '<a>I am a link</a>'
          }}
        />
      </div>
      <div className={classes.example}>
        <Typography>
          ```
          <br />
          const someCode = 'hello world';
          <br />
          ```
        </Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: `<pre style="white-space: pre-wrap;">const someCode = "hello world"</pre>`
          }}
        />
      </div>
    </div>
  );
};

const styled = withStyles(styles);

export default React.memo(styled(MarkdownReference));
