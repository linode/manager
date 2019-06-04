import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import RenderGuard from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import { formatDate } from 'src/utilities/format-date-iso8601';
import ActionMenu from './ImagesActionMenu';

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
  image: Linode.Image;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ImageRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, image, ...rest } = props;
  return (
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

const styled = withStyles(styles);

export default styled(RenderGuard<Props>(ImageRow));
