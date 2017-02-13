import React, { PropTypes } from 'react';

export default function NewSlaveZone(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Domain:</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            value={props.dnszone}
            placeholder="mydomain.net"
            onChange={props.onChange('dnszone')}
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Masters:</label>
        <div className="col-sm-6">
          <textarea
            value={props.masters}
            className="form-control"
            placeholder="98.139.180.149, 98.139.180.150"
            onChange={props.onChange('masters')}
          />
          <small className="text-muted">
            The IP addresses of the master DNS servers for this<br />
            zone must be semicolon or new line delimited.
          </small>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-2"></div>
        <div className="col-sm-6">
          <button className="btn btn-default">Create</button>
        </div>
      </div>
    </form>
  );
}

NewSlaveZone.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  masters: PropTypes.string.isRequired,
  dnszone: PropTypes.string.isRequired,
};
