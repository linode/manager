import * as React from 'react';

import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';

import RenderGuard from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import { formatDate } from 'src/utilities/format-date-iso8601';

import ActionMenu from './ImagesActionMenu';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  label: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
});

interface Props {
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (image: string, imageID: string) => void;
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  image: Linode.Image;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ImageRow: React.StatelessComponent<CombinedProps> = (props) => {
    const { classes, image, ...rest } = props;
    return (
        <TableRow key={image.id} data-qa-image-cell={image.id}>
            <TableCell parentColumn="Label" className={classes.label} data-qa-image-label>
            {image.label}
            </TableCell>
            <TableCell parentColumn="Date Created" data-qa-image-date>
                {formatDate(image.created)}
            </TableCell>
            <TableCell parentColumn="Size" data-qa-image-size>{image.size} MB</TableCell>
            <TableCell>
                <ActionMenu
                    image={image}
                    {...rest}
                />
            </TableCell>
        </TableRow>
    );
};

const styled = withStyles(styles, { withTheme: true });

export default RenderGuard<Props>(styled<Props>(ImageRow));
