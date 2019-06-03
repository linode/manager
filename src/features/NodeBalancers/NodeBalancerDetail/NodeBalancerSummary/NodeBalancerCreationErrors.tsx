import * as React from 'react';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface ErrorResponse {
  errors: Linode.ApiFieldError[];
}

interface ConfigErrorResponse extends ErrorResponse {
  config: Partial<Linode.NodeBalancerConfig>;
}

interface NodeErrorResponse extends ErrorResponse {
  config: Partial<Linode.NodeBalancerConfigNode>;
}

export type ConfigOrNodeErrorResponse = ConfigErrorResponse | NodeErrorResponse;

interface Props {
  errors?: ConfigOrNodeErrorResponse[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NodeBalancerCreationError: React.StatelessComponent<
  CombinedProps
> = props => {
  const { errors } = props;

  return !errors || errors.length === 0 ? null : (
    <React.Fragment>
      {errors.map((errResponse, idx) => {
        const message = isNodeError(errResponse)
          ? `Unable to create node ${errResponse.config.label}.`
          : `Unable to create config for port ${errResponse.config.port}.`;

        return (
          <Notice key={idx} error typeProps={{ component: 'div' }}>
            {message}
            {maybeListReason(errResponse.errors)}
          </Notice>
        );
      })}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(NodeBalancerCreationError);

const maybeListReason = (errors?: Linode.ApiFieldError[]) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <List dense>
      {errors.map(e => (
        <ListItem key={e.reason}>
          <ListItemText disableTypography primary={e.reason} />
        </ListItem>
      ))}
    </List>
  );
};

const isNodeError = (v: ConfigOrNodeErrorResponse): v is NodeErrorResponse =>
  v.config.hasOwnProperty('label') && v.config.hasOwnProperty('address');
