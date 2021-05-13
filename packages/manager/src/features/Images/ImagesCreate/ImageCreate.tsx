import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import NavTabs, { NavTab } from 'src/components/NavTabs/NavTabs';
import SuspenseLoader from 'src/components/SuspenseLoader';
import ImagesPricingBanner from '../ImagesPricingBanner';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  banner: {
    padding: '0.5rem 0',
  },
}));

type CombinedProps = RouteComponentProps<{}>;

const CreateImageTab = React.lazy(() => import('./CreateImageTab'));
const ImageUpload = React.lazy(() => import('../ImageUpload'));

export const ImageCreate: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const [label, setLabel] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const handleSetLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLabel(value);
  };

  const handleSetDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
  };

  const tabs: NavTab[] = [
    {
      title: 'Capture Image',
      routeName: `${props.match.url}/disk`,
      render: (
        <CreateImageTab
          label={label}
          description={description}
          changeLabel={handleSetLabel}
          changeDescription={handleSetDescription}
        />
      ),
    },
    {
      title: 'Upload Image',
      routeName: `${props.match.url}/upload`,
      render: (
        <ImageUpload
          label={label}
          description={description}
          changeLabel={handleSetLabel}
          changeDescription={handleSetDescription}
          canCreateImage
        />
      ),
    },
  ];

  return (
    <>
      <DocumentTitleSegment segment="Create Image" />
      <div className={classes.banner}>
        <ImagesPricingBanner />
      </div>
      <React.Suspense fallback={<SuspenseLoader />}>
        <NavTabs tabs={tabs} />
      </React.Suspense>
    </>
  );
};

export default withRouter(ImageCreate);
