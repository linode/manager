import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  example: {
    backgroundColor: theme.name === 'dark' ? theme.bg.white : theme.bg.offWhite,
    margin: `${theme.spacing(2)} 0`,
    padding: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  isReply?: boolean;
  rootClass?: string;
}

export const MarkdownReference = (props: Props) => {
  const { classes } = useStyles();

  return (
    <div className={props.rootClass}>
      <Typography>
        You can use Markdown to format your{' '}
        {props.isReply ? 'reply' : 'question'}. For more examples see this{' '}
        <Link external to="http://demo.showdownjs.com/">
          Markdown cheatsheet
        </Link>
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
