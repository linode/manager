import * as React from 'react';
import Typography from 'src/components/core/Typography';

interface Props {
  rootClass?: string;
}

const MarkdownReference: React.FC<Props> = props => {
  return (
    <div className={props.rootClass}>
      <Typography>
        <strong>Tips</strong>
      </Typography>
      <Typography>
        You can use Markdown to format your question. For more examples see the
        <a target="_blank" href="http://demo.showdownjs.com/">
          {' '}
          Markdown Cheatsheet.
        </a>
      </Typography>
      <Typography>
        <strong>Examples</strong>
      </Typography>
      <Typography>[I am a link](https://google.com)</Typography>
      <Typography
        dangerouslySetInnerHTML={{
          __html: "<a href='#'>I am a link</a>"
        }}
      />
      <br />
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
  );
};

export default React.memo(MarkdownReference);
