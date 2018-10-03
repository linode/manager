import * as moment from 'moment';
import { compose, filter, flatten, groupBy, head, map, prop, propSatisfies, reverse, sortBy, startsWith, tail, values } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import TabbedPanel from 'src/components/TabbedPanel';

type ClassNames = 'root' | 'flatImagePanel' | 'flatImagePanelSelections';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  flatImagePanel: {
    padding: theme.spacing.unit * 3,
  },
  flatImagePanelSelections: {
    marginTop: theme.spacing.unit * 2,
    padding: `${theme.spacing.unit}px 0`,
  },
  root: {},
});

const distroIcons = {
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu',
};

interface Props {
  images: Linode.Image[];
  error?: string;
  selectedImageID: string | null;
  handleSelection: (id: string) => void;
  hideMyImages?: boolean;
  initTab?: number;
}

const sortByVendor = sortBy(prop('vendor'));

const sortCreatedDESC = compose<any, any, any>(
  reverse,
  sortBy(
    compose(
      created => moment(created).format('x'),
      prop('created'),
    ),
  ),
);

const groupByVendor = groupBy(prop('vendor'));

export const getPublicImages = compose<any, any, any, any, any, any, any>(
  sortByVendor,
  values,
  map(head),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id')),
);

export const getOlderPublicImages = compose<any, any, any, any, any, any>(
  sortByVendor,
  compose(flatten, values, map(tail)),
  groupByVendor,
  sortCreatedDESC,
  filter(propSatisfies(startsWith('linode'), 'id')),
);

export const getMyImages = compose<any, any, any>(
  sortCreatedDESC,
  filter(propSatisfies(startsWith('private'), 'id')),
);

type CombinedProps = Props & WithStyles<ClassNames>;

const CreateFromImage: React.StatelessComponent<CombinedProps> = (props) => {
  const { images, error, handleSelection } = props;
  const publicImages = getPublicImages(images);
  const olderPublicImages = getOlderPublicImages(images);
  const myImages = getMyImages(images);

  const renderPublicImages = () => (
    publicImages.length
    && publicImages.map((image: Linode.Image, idx: number) => (
      <SelectionCard
        key={idx}
        checked={image.id === String(props.selectedImageID)}
        onClick={() => handleSelection(image.id)}
        renderIcon={() => {
          return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
        }}
        heading={(image.vendor as string)}
        subheadings={[image.label]}
        data-qa-selection-card
      />
    ))
  );

  const renderOlderPublicImages = () => (
    olderPublicImages.length
    && olderPublicImages.map((image: Linode.Image, idx: number) => (
      <SelectionCard
        key={idx}
        checked={image.id === String(props.selectedImageID)}
        onClick={() => handleSelection(image.id)}
        renderIcon={() => {
          return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
        }}
        heading={(image.vendor as string)}
        subheadings={[image.label]}
      />
    ))
  );

  const tabs = [
    {
      title: 'Public Images',
      render: () => (
        <React.Fragment>
          <Grid container spacing={16}>
            {renderPublicImages()}
          </Grid>
          <ShowMoreExpansion name="Show Older Images">
            <Grid container spacing={16} style={{ marginTop: 16 }}>
              {renderOlderPublicImages()}
            </Grid>
          </ShowMoreExpansion>
        </React.Fragment>
      ),
    },
    {
      title: 'My Images',
      render: () => (
        <Grid container>
          {myImages && myImages.map((image: Linode.Image, idx: number) => (
            <SelectionCard
              key={idx}
              checked={image.id === String(props.selectedImageID)}
              onClick={() => handleSelection(image.id)}
              renderIcon={() => <span className="fl-tux" />}
              heading={(image.label as string)}
              subheadings={[(image.description as string)]}
            />
          ))}
        </Grid>
      ),
    },
  ];

  const renderTabs = () => {
    const { hideMyImages } = props;
    if (hideMyImages) {
      return tabs;
    }
    return tabs;
  }

  return (
    <React.Fragment>
      {(props.hideMyImages !== true) // if we have no olderPublicImage, hide the dropdown
        ? <TabbedPanel
          error={error}
          header="Select Image"
          tabs={renderTabs()}
          initTab={props.initTab}
        />
        : <Paper className={props.classes.flatImagePanel} data-qa-tp="Select Image">
          {error && <Notice text={error} error />}
          <Typography role="header" variant="title" data-qa-tp="Select Image">
            Select Image
          </Typography>
          <Grid className={props.classes.flatImagePanelSelections} container>
            {renderPublicImages()}
          </Grid>
          {olderPublicImages.length > 0 &&
            <ShowMoreExpansion name="Show Older Images">
              <Grid container spacing={16} style={{ marginTop: 16 }}>
                {renderOlderPublicImages()}
              </Grid>
            </ShowMoreExpansion>
          }
        </Paper>
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default RenderGuard<Props>(styled(CreateFromImage));
