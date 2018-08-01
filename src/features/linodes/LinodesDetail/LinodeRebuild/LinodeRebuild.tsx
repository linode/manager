import { always, compose, cond, groupBy, pathOr, propOr } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import ErrorState from 'src/components/ErrorState';
import MenuItem from 'src/components/MenuItem';
import PasswordInput from 'src/components/PasswordInput';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Select from 'src/components/Select';
import { resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getImages } from 'src/services/images';
import { rebuildLinode } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { withLinode } from '../context';

type ClassNames = 'root'
 | 'title'
 | 'intro'
 | 'imageControl'
 | 'image';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  intro: {
    marginBottom: theme.spacing.unit * 2,
  },
  imageControl: {
    display: 'flex',
  },
  image: {
    display: 'flex',
    flexWrap: 'wrap',
  },
});

interface Props { }

interface ContextProps {
  linodeId: number;
}

interface PromiseLoaderProps {
  images: PromiseLoaderResponse<Linode.Image[]>;
}

interface State {
  images: GroupedImages;
  errors?: Linode.ApiFieldError[];
  selected?: string;
  password?: string;
}

type CombinedProps = Props & PromiseLoaderProps & ContextProps &  WithStyles<ClassNames>;

class LinodeRebuild extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      images: groupImages(props.images.response),
      selected: pathOr(undefined, ['history', 'location', 'state', 'selectedImageId'], props)
    };
  }

  onSubmit = () => {
    const { linodeId } = this.props;
    const { selected, password } = this.state;
    const errors: Linode.ApiFieldError[] = [];

    /** Reset errors */
    this.setState({ errors: undefined });

    if (!selected) {
      errors.push({ field: 'image', reason: 'Image cannot be blank.' });
    }

    if (!password) {
      errors.push({ field: 'password', reason: 'Password cannot be blank.' });
    }

    if (!selected || !password) {
      /** I hate that I have to do it this way, but TS is complaining.  */
      this.setState({ errors }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    rebuildLinode(linodeId, selected, password)
      .then((response) => {
        resetEventsPolling();
        this.setState({ errors: undefined, selected: undefined, password: undefined });
        sendToast('Linode rebuild started.');
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  onImageChange = (value: string) => this.setState({ selected: value });

  onPasswordChange = (value: string) => this.setState({ password: value });

  renderImagesMenuItems = (category: string) => {
    if (this.state.images[category]) {
      return [
        <MenuItem key={category} disabled className="selectHeader" data-qa-select-header>
          {getDisplayNameForGroup(category)}
        </MenuItem>,
        ...this.state.images[category].map(
          ({ id, label }: Linode.Image) => (
            <MenuItem key={id} value={id} data-qa-image-option>
              {label}
            </MenuItem>
          )
        )
      ]
    }
    return [];
  }

  render() {
    const { images: { error: imagesError }, classes } = this.props;
    const { errors, selected } = this.state;

    if (imagesError) {
      return <ErrorState errorText="There was an error retrieving images information." />;
    }

    const getErrorFor = getAPIErrorFor({}, errors);
    const imageError = getErrorFor('image');
    const passwordError = getErrorFor('password');

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography
            variant="headline"
            className={classes.title}
            data-qa-title
          >
            Rebuild
          </Typography>
          <Typography className={classes.intro} data-qa-rebuild-desc>
            If you can't rescue an existing disk, it's time to rebuild your Linode.
            There are a couple of different ways you can do this:
            either restore from a backup or start over with a fresh Linux
            distribution. Rebuilding will destroy all data.
          </Typography>
          <FormControl className={classes.imageControl}>
            <InputLabel htmlFor="image-select" disableAnimation shrink={true}>
              Image
            </InputLabel>
            <div>
              <Select
                tooltipText="Choosing a 64-bit distro is recommended."
                error={Boolean(imageError)}
                value={selected || 'select'}
                onChange={e => this.onImageChange(e.target.value)}
                inputProps={{ name: 'image-select', id: 'image-select' }}
                data-qa-rebuild-image
              >
                <MenuItem value={'select'} disabled>
                  Select an Image
                </MenuItem>
                {
                  ['recommended', 'older', 'images', 'deleted'].map((category) => [
                    ...this.renderImagesMenuItems(category),
                  ])
                }
              </Select>
              {imageError &&
              <FormHelperText error data-qa-image-error>{imageError}</FormHelperText>}
            </div>
          </FormControl>

          <PasswordInput
            label="Root Password"
            onChange={e => this.onPasswordChange(e.target.value)}
            errorText={passwordError}
            value={this.state.password || ''}
          />
          <ActionsPanel>
            <Button
              variant="raised"
              color="secondary"
              className="destructive"
              onClick={this.onSubmit}
              data-qa-rebuild
            >
              Rebuild
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader({
  /** @todo filter for available */
  images: ({ linodeId }) => getImages()
    .then(response => response.data),
});

const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
}));

export default compose<any, any, any, any, any>(
  linodeContext,
  preloaded,
  SectionErrorBoundary,
  styled,
)(LinodeRebuild);

interface GroupedImages {
  deleted?: Linode.Image[];
  recommended?: Linode.Image[];
  older?: Linode.Image[];
  images?: Linode.Image[];
}

const isRecentlyDeleted = (i: Linode.Image) => i.created_by === null && i.type === 'automatic';
const isByLinode = (i: Linode.Image) => i.created_by !== null && i.created_by === 'linode';
const isDeprecated = (i: Linode.Image) => i.deprecated === true;
const isRecommended = (i: Linode.Image) => isByLinode(i) && !isDeprecated(i);
const isOlderImage = (i: Linode.Image) => isByLinode(i) && isDeprecated(i);

export let groupImages: (i: Linode.Image[]) => GroupedImages;
groupImages = groupBy(cond([
  [isRecentlyDeleted, always('deleted')],
  [isRecommended, always('recommended')],
  [isOlderImage, always('older')],
  [(i: Linode.Image) => true, always('images')],
]));

const groupNameMap = {
  _default: 'Other',
  deleted: 'Recently Deleted Disks',
  recommended: '64-bit Distributions - Recommended',
  older: 'Older Distributions',
  images: 'Images',
};

const getDisplayNameForGroup = (key: string) => propOr('Other', key, groupNameMap);
