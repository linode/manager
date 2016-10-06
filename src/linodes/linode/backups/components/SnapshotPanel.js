import React from 'react';

export function snapshotPanel() {
  /* TODO:
   * Waiting on endpoint update for:
   * - Config Profiles
   * - Disks
   * - Space Required
   * - Take Snapshot Submit
   */
  /* if(!snapshot) {*/
  return (
    <section className="card">
      <header>
        <h2>Snapshot</h2>
      </header>
      <div className="form-group row snapshot-button">
        <div className="col-sm-12 label-col left">
          <form>
            <button type="submit" className="btn btn-primary">
              Take Snapshot
            </button>
          </form>
        </div>
      </div>
    </section>
  );
  /* }

  const duration = moment(snapshot.finished).diff(moment(snapshot.created));
  const durationMinutes = moment.duration(duration).asMinutes();

  let durationText = `${Math.round(durationMinutes)} minutes`;
  if(durationMinutes >= 60) {
    durationText = `${Math.floor(durationMinutes / 60)}
      hours ${Math.round(durationMinutes % 60)} minutes`;
  }

  return (
    <section className="card">
      <header>
        <h2>Snapshot</h2>
      </header>
      { snapshot.label ?
        <div className="form-group row label">
          <div className="col-sm-2 label-col left">Label</div>
          <div className="col-sm-10 content-col right">
            {snapshot.label}
          </div>
        </div>
        : null
      }
      <div className="form-group row started">
        <div className="col-sm-2 label-col left">Started</div>
        <div className="col-sm-10 content-col right">
          {moment(snapshot.created).format('dddd, MMMM D YYYY LT')}
        </div>
      </div>
      <div className="form-group row finished">
        <div className="col-sm-2 label-col left">Finished</div>
        <div className="col-sm-10 content-col right">
          {moment(snapshot.finished).format('dddd, MMMM D YYYY LT')}
        </div>
      </div>
      <div className="form-group row duration">
        <div className="col-sm-2 label-col left">Duration</div>
        <div className="col-sm-10 content-col right">
          {durationText}
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-2 label-col left">Datecenter constraint</div>
        <div className="col-sm-10 content-col right">{snapshot.datacenter.label}</div>
      </div>
      <div className="form-group row snapshot-button">
        <div className="col-sm-12 label-col left">
          <form>
            <button type="submit" className="btn btn-primary">
              Take Snapshot
            </button>
          </form>
        </div>
      </div>
    </section>
  );*/
}
