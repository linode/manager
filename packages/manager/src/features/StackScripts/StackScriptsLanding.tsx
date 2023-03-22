import { Image } from '@linode/api-v4';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LandingHeader from 'src/components/LandingHeader';
import Notice from 'src/components/Notice';
import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';
import StackScriptPanel from './StackScriptPanel';

export const StackScriptsLanding = () => {
  const history = useHistory<{
    successMessage?: string;
  }>();

  const { data: _imagesData, isLoading: _loading } = useAllImagesQuery(
    {},
    { is_public: true }
  );

  const imagesData: Record<string, Image> = listToItemsByID(_imagesData ?? []);

  const goToCreateStackScript = () => {
    history.push('/stackscripts/create');
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      {!!history.location.state && !!history.location.state.successMessage ? (
        <Notice success text={history.location.state.successMessage} />
      ) : null}
      <LandingHeader
        title="StackScripts"
        entity="StackScript"
        removeCrumbX={1}
        docsLink="https://www.linode.com/docs/platform/stackscripts"
        onButtonClick={goToCreateStackScript}
      />
      <Grid container className="m0">
        {_loading ? (
          <CircleProgress />
        ) : (
          <Grid item className="p0" xs={12}>
            <StackScriptPanel
              publicImages={imagesData}
              queryString={history.location.search}
              history={history}
              location={history.location}
            />
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default StackScriptsLanding;
