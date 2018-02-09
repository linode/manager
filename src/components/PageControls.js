import React from 'react';
import PropTypes from 'prop-types';

export default function PageControls(props) {
  const pageNums = [];
  for (let i = 1; i <= props.totalPages; ++i) {
    pageNums.push(
      <span className="h3 mr-2">
        {(i - 1) === props.currentPage ?
          <span key={i}>{i} </span>
          : <a className="text-primary" key={i} onClick={() => props.getPage(i - 1)}>{i} </a>
        }
      </span>
    );
  }

  return (
    <div className="m-0">
      <a onClick={props.getFirstPage}>
        <span className="h2 mr-2 text-primary"><span className="fa fa-angle-double-left" /></span>
      </a>
      <a onClick={props.getPreviousPage}>
        <span className="h2 mr-3 text-primary"><span className="fa fa-angle-left" /></span>
      </a>
      {pageNums}
      <a onClick={props.getNextPage}>
        <span className="h2 mr-2 text-primary"><span className="fa fa-angle-right" /></span>
      </a>
      <a onClick={props.getLastPage}>
        <span className="h2 mr-2 text-primary"><span className="fa fa-angle-double-right" /></span>
      </a>
    </div>
  );
}

PageControls.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  getPage: PropTypes.func,
  getFirstPage: PropTypes.func,
  getPreviousPage: PropTypes.func,
  getNextPage: PropTypes.func,
  getLastPage: PropTypes.func,
};
