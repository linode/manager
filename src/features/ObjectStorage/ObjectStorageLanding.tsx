import * as React from 'react';
// @todo: remove router imports when bucket creation is supported
import { RouterProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import bucketContainer, {
  Props as BucketContainerProps
} from 'src/containers/bucket.container';
import ListBuckets from './ListBuckets';

type ClassNames = 'root' | 'titleWrapper' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  titleWrapper: {
    flex: 1
  },
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  }
});

// @todo: remove RouterProps when bucket creation is supported
type CombinedProps = BucketContainerProps &
  RouterProps &
  WithStyles<ClassNames>;

export const ObjectStorageLanding: React.StatelessComponent<
  CombinedProps
> = props => {
  // @todo: remove router.history prop when bucket creation is supported
  const { classes, bucketsData, bucketsLoading, bucketsError, history } = props;

  if (bucketsLoading) {
    return <RenderLoading data-qa-loading-state />;
  }

  if (bucketsError) {
    return <RenderError data-qa-error-state />;
  }

  if (bucketsData.length === 0) {
    // Our call-to-action should be "Create a Bucket". Since that feature
    // doesn't exist yet, the call-to-action is temporarily a link to API Tokens.
    return (
      <RenderEmpty
        onClick={() => history.push(`/profile/tokens`)}
        data-qa-empty-state
      />
    );
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        style={{ paddingBottom: 0 }}
      >
        <Grid item className={classes.titleWrapper}>
          <Typography
            role="header"
            variant="h1"
            data-qa-title
            className={classes.title}
          >
            Buckets
          </Typography>
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
      <DocumentTitleSegment segment="Domains" />
      <Placeholder
        title="Add a Bucket"
        // NOTE: This copy is only temporary, until bucket creation exists.
        // It will never be customer facing.
        copy="Bucket Creation coming soon! For now, create buckets by generating an Object Storage key pair, and use with an S3-compatible client."
        // @todo: replace with bucket icon
        icon={VolumeIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Go to API Tokens'
        }}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  // @todo: remove withRouter HOC once bucket creation is support
  withRouter,
  styled,
  bucketContainer
);

export default enhanced(ObjectStorageLanding);
