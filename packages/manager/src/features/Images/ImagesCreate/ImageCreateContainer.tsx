import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import ImageCreate from './ImageCreate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  header: {
    paddingLeft: theme.spacing(),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
}));

export const ImagesCreateContainer: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Grid container className={classes.header}>
        <Grid item xs={12} className="p0">
          <Breadcrumb
            pathname={'/images/create'}
            labelTitle="Create"
            data-qa-create-image-header
          />
        </Grid>
        <Grid item className="p0">
          <DocumentationButton href="https://www.linode.com/docs/products/tools/images/" />
        </Grid>
      </Grid>
      <Grid item className="p0" xs={12}>
        <ImageCreate />
      </Grid>
    </Grid>
  );
};

export default ImagesCreateContainer;
