import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
  },
  example: {
    backgroundColor:
      theme.name === 'darkTheme' ? theme.bg.white : theme.bg.offWhite,
    margin: `${theme.spacing(2)}px 0`,
    padding: theme.spacing(2),
  },
}));

interface Props {
  rootClass?: string;
  isReply?: boolean;
}

type CombinedProps = Props;

const MarkdownReference: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

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
            __html: '<a>I am a link</a>',
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
            __html: `<pre style="white-space: pre-wrap;">const someCode = "hello world"</pre>`,
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(MarkdownReference);
