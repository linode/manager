import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import ImageCreate from './ImageCreate';

export const ImagesCreateContainer: React.FC = () => {
  return (
    <>
      <DocumentTitleSegment segment="Create an Image" />
      <Grid container alignItems="center" justify="space-between">
        <Grid item className="p0">
          <Breadcrumb
            pathname={'/images/create'}
            labelTitle="Create"
            data-qa-create-image-header
          />
        </Grid>
        <Grid item className="p0">
          <DocumentationButton href="https://www.linode.com/docs/products/tools/images/" />
        </Grid>
        <ImageCreate />
      </Grid>
    </>
  );
};

export default ImagesCreateContainer;
