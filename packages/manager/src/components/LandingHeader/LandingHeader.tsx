import * as React from 'react';

import Grid from 'src/components/Grid';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
2;
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import EntityHeader, {
  HeaderProps
} from 'src/components/EntityHeader/EntityHeader';

const useStyles = makeStyles(() => ({
  button: {
    borderRadius: 3,
    height: 40,
    padding: 0,
    width: 152
  }
}));

interface Props extends Omit<HeaderProps, 'actions'> {
  extraActions?: JSX.Element;
  body?: JSX.Element;
  docsLink: string;
  onAddNew?: () => void;
  entity: string;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { docsLink, onAddNew, entity, extraActions } = props;

  const actions = React.useMemo(
    () => (
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        justify="flex-end"
      >
        {extraActions && <Grid item>{extraActions}</Grid>}
        {onAddNew && (
          <Grid item>
            <Button
              buttonType="primary"
              className={classes.button}
              onClick={onAddNew}
            >
              Create a {entity}
            </Button>
          </Grid>
        )}
        {docsLink && <DocumentationButton href={docsLink} />}
      </Grid>
    ),
    [docsLink, entity, onAddNew, classes.button, extraActions]
  );

  return <EntityHeader isLanding actions={actions} {...props} />;
};

export default LandingHeader;
