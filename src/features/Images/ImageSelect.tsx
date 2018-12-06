import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import { always, cond, groupBy, propOr } from 'ramda';

import FormControl from 'src/components/core/FormControl';
import InputLabel from 'src/components/core/InputLabel';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    width: '100%'
  },
});

interface Props {
  images: Linode.Image[];
  imageError?: string;
  onSelect: (selected: Item<string>) => void;
}

interface State {
  renderedImages: GroupType<string>[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ImageSelect extends React.Component<CombinedProps, State> {
  state: State = {
    renderedImages: renderImagesOptions(this.props.images) as GroupType<string>[],
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.images !== this.props.images) {
      this.setState({
        renderedImages: renderImagesOptions(this.props.images) as GroupType<string>[]
      });
    }
  }

  render() {
    const { classes, imageError, onSelect } = this.props;
    const { renderedImages } = this.state;
    return (
      <FormControl className={classes.root}>
        <InputLabel htmlFor="image-select" disableAnimation shrink={true}>
          Image
        </InputLabel>
          <Select
            // tooltipText="Choosing a 64-bit distro is recommended."
            isMulti={false}
            errorText={imageError}
            onChange={onSelect}
            options={renderedImages as any}
            placeholder="Select an Image"
          />
      </FormControl>
    );
  }
}

const renderImagesOptions = (images: Linode.Image[]) => {
  const groupedImages = groupImages(images);
  return ['recommended', 'older', 'images', 'deleted'].reduce((accumulator: GroupType<string>[], category: string) => {
    if (groupedImages[category]) {
      return [
        ...accumulator,
        {
          label: getDisplayNameForGroup(category),
          options: groupedImages[category].map(
            ({ id, label }: Linode.Image) => (
                { label, value: id }
            )
          )
        }
      ]}
    return accumulator;
  }, []);
}

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

const styled = withStyles(styles);

export default styled(ImageSelect);
