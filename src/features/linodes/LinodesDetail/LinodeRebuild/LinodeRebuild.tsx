import * as React from 'react';
import { always, cond, compose, groupBy, propOr } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';
import InputLabel from 'material-ui/Input/InputLabel';
import MenuItem from 'material-ui/Menu/MenuItem';

import { getImages } from 'src/services/images';
import { rebuild as rebuildLinode } from 'src/services/linodes';
import { resetEventsPolling } from 'src/events';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import Select from 'src/components/Select';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import ActionsPanel from 'src/components/ActionsPanel';
import ErrorState from 'src/components/ErrorState';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
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

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

class LinodeRebuild extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      images: groupImages(props.images.response),
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
      this.setState({ errors });
      return;
    }

    rebuildLinode(linodeId, selected, password)
      .then((response) => {
        resetEventsPolling();
        this.setState({ errors: undefined, selected: undefined, password: undefined });
        /** @todo What is the result here? Toast? Redirect? Brimstone and fire? */
      })
      .catch((errorResponse) => {
        /** @todo Toast notification. */
      });
  }

  onImageChange = (value: string) => this.setState({ selected: value });

  onPasswordChange = (value: string) => this.setState({ password: value });

  render() {
    const { images: { error: imagesError } } = this.props;
    const { errors } = this.state;

    if (imagesError) {
      return <ErrorState errorText="There was an error retrieving images information." />;
    }

    const getErrorFor = getAPIErrorFor({}, errors);
    const imageError = getErrorFor('image');
    const passwordError = getErrorFor('password');

    return (
      <Paper>
        <Typography variant="headline">Rebuild</Typography>
        <Typography>
          If you can't rescue an exiting disk, it's time to rebuild your Linode. There are a couple
          of different ways you can do this, from a backup or start over with a fresh Linux
          distribution. Rebuilding will destroy all data.
        </Typography>
        <FormControl fullWidth>
          <InputLabel htmlFor="image-select" disableAnimation shrink={true}>
            Image
          </InputLabel>
          <Select
            helpText="Choosing a 64-bit distro is recommended."
            error={Boolean(imageError)}
            value={this.state.selected || ''}
            onChange={e => this.onImageChange(e.target.value)}
            inputProps={{ name: 'image-select', id: 'image-select' }}
          >
            <MenuItem value={''} disabled>Select an Image</MenuItem>
            {
              Object
                .entries(this.state.images)
                .map(([group, images]) => [
                  <Typography>{getDisplayNameForGroup(group)}</Typography>,
                  ...images.map(({ id, label }: Linode.Image) =>
                    <MenuItem key={id} value={id}>{label}</MenuItem>),
                ])
            }
          </Select>
          {imageError && <FormHelperText error>{imageError}</FormHelperText>}
        </FormControl>

        <PasswordInput
          label="Root Password"
          onChange={e => this.onPasswordChange(e.target.value)}
          errorText={passwordError}
        />
        <ActionsPanel>
          <Button
            variant="raised"
            color="secondary"
            className="destructive"
            onClick={this.onSubmit}
          >
            Rebuild
          </Button>
        </ActionsPanel>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader({
  /** @todo filter for available */
  images: ({ linodeId }) => getImages()
    .then(response => response.data),
});

export default compose<any, any, any, any>(
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
