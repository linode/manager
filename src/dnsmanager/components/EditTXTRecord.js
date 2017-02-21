import React, { PropTypes, Component } from 'react';

import { dnszones } from '~/api';
import { ModalFormGroup } from '~/components/form';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditTXTRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, dnszone: zone } } = props;
    const {
      target: textvalue,
      name: textname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      saving: false,
      zone,
      defaultTTL,
      ttl,
      textvalue,
      textname,
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { ttl, textvalue, textname } = this.state;

    this.setState({ saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(dnszones.records[id ? 'put' : 'post']({
        ttl_sec: +ttl,
        target: textvalue,
        // '' is the default and will track the zone
        name: textname === this.props.zone.dnszone ? '' : textname,
        type: 'TXT',
      }, ...ids));

      this.setState({ saving: false });
      this.props.close();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const { close } = this.props;
    const { errors, saving, defaultTTL, ttl, textvalue, textname } = this.state;
    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="textname" label="Name" apiKey="name" errors={errors}>
          <Input
            id="textname"
            name="textname"
            value={textname}
            placeholder=""
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup id="textvalue" label="Value" apiKey="target" errors={errors}>
          <Input
            id="textvalue"
            name="textvalue"
            value={textvalue}
            placeholder=""
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup label="TTL" id="ttl" apiKey="ttl_sec" errors={errors}>
          <SelectDNSSeconds
            id="ttl"
            name="ttl"
            value={ttl}
            defaultSeconds={defaultTTL}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>{this.props.id ? 'Save' : 'Add TXT Record'}</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditTXTRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
