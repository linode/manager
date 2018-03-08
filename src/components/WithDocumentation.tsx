import * as React from 'react';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

import DocComponent, { Doc } from './DocComponent';

interface Props {
  title: string;
  render: Function;
  docs: Doc[];
}

export default class WithDocumentation extends React.Component<Props> {
  render() {
    const { title, docs, render, ...rest } = this.props;
    const len = docs.length;

    return (
      <Grid container spacing={40}>
        <Grid item xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={9} xl={10}>
              <Grid item xs={12}>
                <Typography variant="headline" data-test-id="title">{title}</Typography>
              </Grid>
              {render(rest)}
            </Grid>
            <Grid item xs={12} md={3} xl={2}>
              <Typography variant="title">Linode Docs</Typography>
              {docs.map((doc, idx) => <DocComponent key={idx} {...doc} index={idx} count={len} />)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
