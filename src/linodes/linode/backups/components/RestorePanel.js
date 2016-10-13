import React from 'react';

export default function restorePanel() {
  /* TODO:
   * Linode Endpoint needs to be updated for specifying
   *  which backups will be in dropdown
   * If no backup, return null
   */
  return (
    <section className="card">
      <header>
        <h2>Restore</h2>
      </header>
      <form>
        <div className="form-group row restore-backup">
          <div className="col-sm-2 label-col left">Restore to:</div>
          <div className="col-sm-2 content-col right">
            <select className="form-control select-backup">
              <option key={1} value="id1">Snapshot</option>
              <option key={2} value="id2">X Long Ago</option>
              <option key={3} value="id3">X Long Ago</option>
              <option key={4} value="id4">X Long Ago</option>
            </select>
          </div>
        </div>
        <div className="form-group row destroy-current">
          <div className="col-sm-12 checkbox">
            <label htmlFor="destroy-all">
              <input type="checkbox" name="destroy-all" value="true" id="destroy-all" />
              <span>
                Destroy all current disks and backups
              </span>
            </label>
          </div>
        </div>
        <div className="form-group row restore-button">
          <div className="col-sm-12 label-col left">
            <button type="submit" className="btn btn-primary">
              Restore
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
