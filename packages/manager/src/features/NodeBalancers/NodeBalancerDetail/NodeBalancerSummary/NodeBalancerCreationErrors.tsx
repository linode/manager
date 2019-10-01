import {
  NodeBalancerConfig,
  NodeBalancerConfigNode
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import ListItemText from 'src/components/core/ListItemText';
import Notice from 'src/components/Notice';

interface ErrorResponse {
  errors: APIError[];
}

interface ConfigErrorResponse extends ErrorResponse {
  config: Partial<NodeBalancerConfig>;
}

interface NodeErrorResponse extends ErrorResponse {
  config: Partial<NodeBalancerConfigNode>;
}

export type ConfigOrNodeErrorResponse = ConfigErrorResponse | NodeErrorResponse;

interface Props {
  errors?: ConfigOrNodeErrorResponse[];
}

type CombinedProps = Props;

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

export default NodeBalancerCreationError;

const maybeListReason = (errors?: APIError[]) => {
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
