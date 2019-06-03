import * as React from 'react';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';

import { always, cond, groupBy, propOr } from 'ramda';

import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';

type ClassNames = 'root' | 'selectContainer' | 'icon';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    width: '100%'
  },
  icon: {
    marginTop: theme.spacing(2) + 14,
    marginLeft: -theme.spacing(1)
  },
  selectContainer: {
    width: 415 + theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  }
});

interface Props {
  images: Linode.Image[];
  imageError?: string;
  imageFieldError?: string;
  isMulti?: boolean;
  helperText?: string;
  value?: Item | Item[];
  disabled?: boolean;
  onSelect: (selected: Item<any> | Item<any>[]) => void;
}

interface State {
  renderedImages: GroupType<string>[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class ImageSelect extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    renderedImages: getImagesOptions(this.props.images) as GroupType<string>[]
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (!this.mounted) {
      return;
    }
    if (prevProps.images !== this.props.images) {
      this.setState({
        renderedImages: getImagesOptions(this.props.images) as GroupType<
          string
        >[]
      });
    }
  }

  render() {
    const {
      classes,
      helperText,
      imageError,
      imageFieldError,
      isMulti,
      onSelect,
      value,
      disabled
    } = this.props;
    const { renderedImages } = this.state;
    return (
      <React.Fragment>
        <Grid
          className={classes.root}
          container
          wrap="nowrap"
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid item className={classes.selectContainer}>
            <Select
              id={'image-select'}
              value={value}
              isMulti={Boolean(isMulti)}
              errorText={imageError || imageFieldError}
              disabled={disabled || Boolean(imageError)}
              onChange={onSelect}
              options={renderedImages as any}
              placeholder="Select an Image"
              label="Image"
            />
          </Grid>
          <Grid item xs={1}>
            <HelpIcon
              className={classes.icon}
              text={helperText || 'Choosing a 64-bit distro is recommended.'}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export const getImagesOptions = (images: Linode.Image[]) => {
  const groupedImages = groupImages(images);
  return ['recommended', 'older', 'images', 'deleted'].reduce(
    (accumulator: GroupType<string>[], category: string) => {
      if (groupedImages[category]) {
        return [
          ...accumulator,
          {
            label: getDisplayNameForGroup(category),
            options: groupedImages[category].map(
              ({ id, label }: Linode.Image) => ({ label, value: id })
            )
          }
        ];
      }
      return accumulator;
    },
    []
  );
};

interface GroupedImages {
  deleted?: Linode.Image[];
  recommended?: Linode.Image[];
  older?: Linode.Image[];
  images?: Linode.Image[];
}

const isRecentlyDeleted = (i: Linode.Image) =>
  i.created_by === null && i.type === 'automatic';
const isByLinode = (i: Linode.Image) =>
  i.created_by !== null && i.created_by === 'linode';
const isDeprecated = (i: Linode.Image) => i.deprecated === true;
const isRecommended = (i: Linode.Image) => isByLinode(i) && !isDeprecated(i);
const isOlderImage = (i: Linode.Image) => isByLinode(i) && isDeprecated(i);

export let groupImages: (i: Linode.Image[]) => GroupedImages;
groupImages = groupBy(
  cond([
    [isRecentlyDeleted, always('deleted')],
    [isRecommended, always('recommended')],
    [isOlderImage, always('older')],
    [(i: Linode.Image) => true, always('images')]
  ])
);

export const groupNameMap = {
  _default: 'Other',
  deleted: 'Recently Deleted Disks',
  recommended: '64-bit Distributions - Recommended',
  older: 'Older Distributions',
  images: 'Images'
};

const getDisplayNameForGroup = (key: string) =>
  propOr('Other', key, groupNameMap);

const styled = withStyles(styles);

export default styled(ImageSelect);
