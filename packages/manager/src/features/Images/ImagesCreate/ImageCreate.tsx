import * as React from 'react';
import {
  matchPath,
  RouteComponentProps,
  useRouteMatch,
} from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Typography from 'src/components/core/Typography';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';

const useStyles = makeStyles((theme: Theme) => ({}));

export const ImageCreate: React.FC = () => {
  return <div>ImageCreate Component</div>;
};

export default ImageCreate;
