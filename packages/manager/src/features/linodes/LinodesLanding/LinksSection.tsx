import * as React from 'react';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';

interface Props {
  title: string;
  icon: (props: any) => JSX.Element;
  children?: JSX.Element | JSX.Element[] | null;
  moreLink: JSX.Element;
}

const LinksSection = (props: Props) => {
  const { icon: Icon, title, children, moreLink } = props;
  return (
    <Grid container item xs={12} sm={4} spacing={0}>
      <Grid
        container
        item
        xs={12}
        style={{ alignItems: 'baseline', marginBottom: 8, lineHeight: 1.286 }}
      >
        <Icon style={{ color: '#3683DC', marginRight: 8 }} />{' '}
        <Typography variant="h2">{title}</Typography>
      </Grid>
      <Grid container item xs={12} spacing={1}>
        {children}
      </Grid>
      <Grid item xs={12} style={{ marginTop: 8 }}>
        {moreLink}
      </Grid>
    </Grid>
  );
};

export default LinksSection;
