import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';

import Breadcrumb from 'src/components/Breadcrumb';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImagesContainer, {
  WithImages
} from 'src/containers/withImages.container';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { filterImagesByType } from 'src/store/image/image.helpers';
import StackScriptPanel from './StackScriptPanel/StackScriptPanel_CMR';

type CombinedProps = WithImages & RouteComponentProps<{}>;

export const StackScriptsLanding: React.FC<CombinedProps> = props => {
  const { history, imagesData } = props;
  const { _loading } = useReduxLoad(['images']);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      {!!history.location.state && !!history.location.state.successMessage && (
        <Notice success text={history.location.state.successMessage} />
      )}
      <Grid
        container
        alignItems="center"
        justify="space-between"
        className="m0"
      >
        <Grid item className="px0">
          <Breadcrumb
            labelTitle="StackScripts"
            pathname={location.pathname}
            removeCrumbX={1}
          />
        </Grid>
        <Grid item className="px0">
          <DocumentationButton href="https://www.linode.com/docs/platform/stackscripts" />
        </Grid>
      </Grid>
      <Grid container className="m0">
        {_loading ? (
          <CircleProgress />
        ) : (
          <Grid item className="p0" xs={12}>
            <StackScriptPanel
              publicImages={imagesData}
              queryString={props.location.search}
              history={props.history}
              location={props.location}
            />
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  withImagesContainer((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: filterImagesByType(imagesData, 'public'),
    imagesLoading,
    imagesError
  }))
)(StackScriptsLanding);
