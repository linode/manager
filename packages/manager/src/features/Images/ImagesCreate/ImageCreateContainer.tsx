import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import ImageCreate from './ImageCreate';
import { makeStyles, Theme } from 'src/components/core/styles';

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
      <DocumentTitleSegment segment="Create an Image" />
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
      <Grid item className="p0">
        <ImageCreate />
      </Grid>
    </Grid>
  );
};

export default ImagesCreateContainer;
