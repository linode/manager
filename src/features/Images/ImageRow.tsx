import * as React from 'react';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import RenderGuard from 'src/components/RenderGuard';
import { formatDate } from 'src/utilities/format-date-iso8601';

import ActionMenu from './ImagesActionMenu';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  label: {
    width: '30%',
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
            <TableCell className={classes.label} data-qa-image-label>
            {image.label}
            </TableCell>
            <TableCell data-qa-image-date>{formatDate(image.created)}</TableCell>
            <TableCell data-qa-image-size>{image.size} MB</TableCell>
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
