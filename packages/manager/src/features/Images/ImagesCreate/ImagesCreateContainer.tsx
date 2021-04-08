import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';

// type CombinedProps = Props;

export const ImagesCreateContainer: React.FC = () => {
  return (
    <>
      <DocumentTitleSegment segment="Create an Image" />
      <Grid container spacing={0} className="m0">
        <Grid item xs={12} className="p0">
          <Breadcrumb
            pathname={'/images/create'}
            labelTitle="Create"
            data-qa-create-image-header
          />
        </Grid>
        {/* <ImagesCreate /> */}
      </Grid>
    </>
  );
};

export default ImagesCreateContainer;
