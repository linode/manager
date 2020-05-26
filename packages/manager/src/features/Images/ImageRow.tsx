import { Image } from '@linode/api-v4/lib/images';
import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import RenderGuard from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import { formatDate } from 'src/utilities/format-date-iso8601';
import ActionMenu from './ImagesActionMenu';
import LinearProgress from 'src/components/LinearProgress';

type ClassNames = 'root' | 'label';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      width: '30%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    }
  });

interface Props {
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (image: string, imageID: string) => void;
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  image: ImageWithEvent;
}
export interface ImageWithEvent extends Image {
  event?: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const progressFromEvent = (e?: Event) => {
  return e?.status === 'started' && e?.percent_complete
    ? e.percent_complete
    : undefined;
};

const ImageRow: React.FC<CombinedProps> = props => {
  const { classes, image, ...rest } = props;
  return isImageUpdating(image.event) ? (
    <TableRow key={image.id} data-qa-image-cell={image.id}>
      <TableCell
        parentColumn="Label"
        className={classes.label}
        data-qa-image-label
      >
        {image.label}
      </TableCell>
      <TableCell colSpan={4}>
        <LinearProgress value={progressFromEvent(image.event)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={image.id} data-qa-image-cell={image.id}>
      <TableCell
        parentColumn="Label"
        className={classes.label}
        data-qa-image-label
      >
        {image.label}
      </TableCell>
      <TableCell parentColumn="Created" data-qa-image-date>
        {formatDate(image.created)}
      </TableCell>
      <TableCell parentColumn="Expires" data-qa-image-date>
        {image.expiry ? formatDate(image.expiry) : 'Never'}
      </TableCell>
      <TableCell parentColumn="Size" data-qa-image-size>
        {image.size} MB
      </TableCell>
      <TableCell>
        <ActionMenu image={image} {...rest} />
      </TableCell>
    </TableRow>
  );
};

export const isImageUpdating = (e?: Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) {
    return false;
  }
  return (
    e?.action === 'disk_imagize' && ['scheduled', 'started'].includes(e.status)
  );
};

const styled = withStyles(styles);

export default RenderGuard(styled(ImageRow));
