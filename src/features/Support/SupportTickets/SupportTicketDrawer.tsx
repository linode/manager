import { compose, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';

import { getDomains } from 'src/services/domains';
import { getLinodes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { createSupportTicket } from 'src/services/support';
import { getVolumes } from 'src/services/volumes';
import composeState from 'src/utilities/composeState';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root'
|  'suffix'
|  'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing.unit,
  },
  actionPanel: {
    marginTop: theme.spacing.unit * 2,
  },
});

export interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (response: Linode.SupportTicket) => void;
}

interface State {
  data: Item[];
  inputValue: string;
  loading: boolean;
  ticket: Ticket;
  errors?: Linode.ApiFieldError[];
}

interface Ticket {
  description: string;
  entity_id: string;
  entity_type: string;
  summary: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const L = {
  open: lensPath(['ticket','open']),
  summary: lensPath(['ticket','summary']),
  description: lensPath(['ticket','description']),
  entity_type: lensPath(['ticket','entity_type']),
  entity_id: lensPath(['ticket','entity_id']),
  inputValue: lensPath(['inputValue']),
  data: lensPath(['data']),
  errors: lensPath(['errors']),
};

const entityMap = {
  Linodes: 'linode_id',
  Volumes: 'volume_id',
  Domains: 'domain_id',
  NodeBalancers: 'nodebalancer_id',
}

const entityIdtoNameMap = {
  linode_id: 'Linode',
  volume_id: 'Volume',
  domain_id: 'Domain',
  nodebalancer_id: 'NodeBalancer'
}

const text = {
  placeholder: "Tell us more about the trouble you're having and any steps you've already taken to resolve it."
}

class SupportTicketDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  composeState = composeState;
  defaultTicket: Ticket = {
    summary: '',
    description: '',
    entity_type: 'none',
    entity_id: '',
  }

  state: State = {
    data: [],
    errors: undefined,
    inputValue: '',
    loading: false,
    ticket: this.defaultTicket,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (prevState.ticket.entity_type !== this.state.ticket.entity_type) {
      this.loadSelectedEntities();
    }
    if (prevProps.open !== this.props.open) {
      this.resetDrawer();
    }
  }

  handleThen = (response:Linode.ResourcePage<any>) => {
    const type = this.state.ticket.entity_type;
    const entityItems = response.data.map((entity) => {
      return type === 'domain_id'
        // Domains don't have labels
        ? { value: entity.id, label: entity.domain }
        : { value: entity.id, label: entity.label }
    })
    this.setState({ data: entityItems, loading: false, });
  }

  handleCatch = (errors:Linode.ApiFieldError[]) => {
    const err: Linode.ApiFieldError[] = [{ field: 'none', reason: 'An unexpected error has ocurred.' }];
    this.setState({
      errors: pathOr(err, ['response', 'data', 'errors'], errors),
      loading: false,
    })
  }

  loadSelectedEntities = () => {
    this.setState({ loading: true });
    const entity = this.state.ticket.entity_type;
    // This is awkward but TypeScript does not like promises
    // that have different signatures.
    switch (entity) {
      case 'linode_id': {
        getLinodes().then(this.handleThen).catch(this.handleCatch);
        return;
      }
      case 'volume_id': {
        getVolumes().then(this.handleThen).catch(this.handleCatch);
        return;
      }
      case 'domain_id': {
        getDomains().then(this.handleThen).catch(this.handleCatch);
        return;
      }
      case 'nodebalancer_id': {
        getNodeBalancers().then(this.handleThen).catch(this.handleCatch);
        return;
      }
      default: {
        this.setState({ data: [], loading: false, });
        return;
      }
    }
  }

  resetDrawer = () => {
    if (this.mounted) { this.setState({ errors: undefined, data: [], inputValue: '', ticket: this.defaultTicket }); }
  }

  handleSummaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(set(L.summary, e.target.value));
  }

  handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.description, e.target.value),
      set(L.errors, undefined)
    ]);
  }

  handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Don't reset things if the type hasn't changed
    if (this.state.ticket.entity_type === e.target.value) { return; }
    this.composeState([
      set(L.entity_type, e.target.value),
      set(L.entity_id, undefined),
      set(L.inputValue, ''),
      set(L.data, []),
      set(L.errors, undefined),
    ]);
  }

  handleEntityIDChange = (selected:Item) => {
    if (selected) { this.setState(set(L.entity_id, selected.value)) }
  }

  getHasNoEntitiesMessage = () : string =>  {
    const { data, ticket, loading } = this.state;
    if (['none','general'].includes(ticket.entity_type) || loading) { return ''; }
    else if (data.length === 0) {
      // User has selected a type from the drop-down but the entity list is empty.
      return `You don't have any ${entityIdtoNameMap[ticket.entity_type]}s on your account.`;
    } else {
      // Default case
      return '';
    }
  }

  close = () => {
    this.props.onClose();
    if (this.mounted) { this.resetDrawer(); }
  }

  onInputValueChange = (inputValue:string) => {
    this.setState({ inputValue });
  }

  onSubmit = () => {
    const { description, entity_type, entity_id, summary } = this.state.ticket;
    const { onSuccess } = this.props;
    if (!['none','general'].includes(entity_type) && !entity_id) {
      this.setState({
        errors: [{ field: 'input', reason: `Please select a ${entityIdtoNameMap[entity_type]}.`}]
      });
      return;
    }
    /* A whitespace reply text (e.g. '    ') will pass the API,
    * but we will filter out blank responses from the list. Prevent the user
    * from submitting blank replies to avoid confusion.
    */
    if (description.trim() === '') {
      this.setState({
        errors: [{'field':'description', 'reason':'Description can\'t be blank.'}],
      });
      return;
    }
    this.setState({ errors: undefined });
    createSupportTicket({
      description,
      summary,
      [entity_type]: Number(entity_id)
    })
      .then((response) => {
        onSuccess(response);
        if (!this.mounted) { return; }
        this.setState({
          errors: undefined,
          ticket: this.defaultTicket
        });
        this.close();
      })
      .catch((errors) => {
        if (!this.mounted) { return; }
        const err: Linode.ApiFieldError[] = [{ reason: 'An unexpected error has ocurred.' }];
        this.setState({
          errors: pathOr(err, ['response', 'data', 'errors'], errors)
        })
      })
  }

  renderEntityTypes = () => {
    return Object.keys(entityMap).map((key:string, idx:number) => {
      return <MenuItem key={idx} value={entityMap[key]}>{key}</MenuItem>
    });
  }

  render() {
    const { data, errors, inputValue, ticket } = this.state;
    const requirementsMet = (ticket.description.length > 0 && ticket.summary.length > 0);

    const hasErrorFor = getAPIErrorFor({
      summary: 'Summary',
      description: 'Description',
    }, errors);
    const summaryError = hasErrorFor('summary');
    const descriptionError = hasErrorFor('description');
    const generalError = hasErrorFor('none');
    const inputError = hasErrorFor('input');

    const hasNoEntitiesMessage = this.getHasNoEntitiesMessage();

    return (
      <Drawer
        open={this.props.open}
        onClose={this.props.onClose}
        title="Open a Support Ticket"
      >
        {generalError &&
          <Notice
            error
            text={generalError}
            data-qa-notice
          />
        }

        <Typography
          data-qa-support-ticket-helper-text
        >
          {`We love our customers, and we're here to help if you need us.
          Please keep in mind that not all topics are within the scope of our support.
          For overall system status, please see `}
          <a href="https://status.linode.com">status.linode.com</a>.
        </Typography>

        <TextField
          select
          label="What is this regarding?"
          value={ticket.entity_type}
          onChange={this.handleEntityTypeChange}
          errorText={false}
          data-qa-ticket-entity-type
        >
          <MenuItem key={'none'} value={'none'}>Choose a Product</MenuItem>
          {this.renderEntityTypes()}
          <MenuItem key={'general'} value={'general'}>None/General</MenuItem>
        </TextField>

        {!['none','general'].includes(ticket.entity_type) &&
          <EnhancedSelect
            options={data}
            value={ticket.entity_id}
            handleSelect={this.handleEntityIDChange}
            disabled={data.length === 0}
            errorText={inputError}
            helperText={hasNoEntitiesMessage}
            placeholder={`Select a ${entityIdtoNameMap[ticket.entity_type]}`}
            label={entityIdtoNameMap[ticket.entity_type]}
            inputValue={inputValue}
            onInputValueChange={this.onInputValueChange}
            data-qa-ticket-entity-id
          />
        }

        <TextField
          label="Summary"
          required
          value={ticket.summary}
          onChange={this.handleSummaryInputChange}
          errorText={summaryError}
          data-qa-ticket-summary
        />

        <TextField
          label="Description"
          required
          multiline
          rows={4}
          value={ticket.description}
          onChange={this.handleDescriptionInputChange}
          placeholder={text.placeholder}
          errorText={descriptionError}
          data-qa-ticket-description
        />

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={this.onSubmit}
            disabled={!requirementsMet}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Open Ticket
          </Button>
          <Button
            onClick={this.close}
            variant="raised"
            color="secondary"
            className="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  SectionErrorBoundary,
)(SupportTicketDrawer);
