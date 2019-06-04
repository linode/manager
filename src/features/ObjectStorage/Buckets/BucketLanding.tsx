import * as React from 'react';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import bucketContainer, { StateProps } from 'src/containers/bucket.container';
import bucketDrawerContainer, {
  DispatchProps
} from 'src/containers/bucketDrawer.container';
import ListBuckets from './ListBuckets';

type CombinedProps = StateProps & DispatchProps;

export const BucketLanding: React.StatelessComponent<CombinedProps> = props => {
  const { bucketsData, bucketsLoading, bucketsError, openBucketDrawer } = props;

  if (bucketsLoading) {
    return <RenderLoading data-qa-loading-state />;
  }

  if (bucketsError) {
    return <RenderError data-qa-error-state />;
  }

  if (bucketsData.length === 0) {
    return <RenderEmpty onClick={openBucketDrawer} data-qa-empty-state />;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Grid container justify="flex-end">
        <Grid item>
          <AddNewLink onClick={openBucketDrawer} label="Add a Bucket" />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <OrderBy data={bucketsData} order={'asc'} orderBy={'label'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const listBucketsProps = {
              orderBy,
              order,
              handleOrderChange,
              data: orderedData
            };
            return <ListBuckets {...listBucketsProps} />;
          }}
        </OrderBy>
      </Grid>
    </React.Fragment>
  );
};

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.StatelessComponent<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your buckets. Please reload and try again." />
  );
};

const RenderEmpty: React.StatelessComponent<{
  onClick: () => void;
}> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Placeholder
        title="Add a Bucket"
        copy="Click below to add a Bucket and start using Object Storage today."
        icon={BucketIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Add a Bucket'
        }}
      />
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, {}>(
  bucketContainer,
  bucketDrawerContainer
);

export default enhanced(BucketLanding);
