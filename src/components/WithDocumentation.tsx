import * as React from 'react';

import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

interface Doc {
  title: string;
  src: string;
  body: string;
}

interface Props {
  title: string;
  render: Function;
  docs: Doc[];
}

class DocComponent extends React.Component<Doc> {
  render() {
    const { src, title, body } = this.props;
    return (
      <div>
        <div><a href={src}>{title}</a></div>
        <div>{body}</div>
      </div>
    );
  }
}

export default class WithDocumentation extends React.Component<Props> {
  render() {
    const { title, docs, render, ...rest } = this.props;

    return (
      <Grid container spacing={40}>
        <Grid item xs={12}>
          <Typography variant="display1" data-test-id="title">{title}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={9} xl={10}>
              <Paper elevation={1}>
                {render(rest)}
              </Paper>
            </Grid>
            <Grid item xs={12} md={3} xl={2}>
              Documentation
              {docs.map((doc: Doc, idx) => <DocComponent key={idx} {...doc} />)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
