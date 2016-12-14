import React, { PropTypes } from 'react';

export default function NewMasterZone(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <div className="form-group row">
        <div className="col-sm-2">
          <label>Domain:</label>
        </div>
        <div className="col-sm-6">
          <input
            className="form-control"
            placeholder="mydomain.net"
            value={props.dnszone}
            onChange={props.onChange('dnszone')}
          />
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-2">
          <label>SOA email:</label>
        </div>
        <div className="col-sm-6">
          <input
            type="email"
            value={props.soa_email}
            className="form-control"
            onChange={props.onChange('soa_email')}
          />
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-2"></div>
        <div className="col-sm-6">
          <button className="btn">Create</button>
        </div>
      </div>
    </form>
  );
}

NewMasterZone.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  soa_email: PropTypes.string.isRequired,
  dnszone: PropTypes.string.isRequired,
};
