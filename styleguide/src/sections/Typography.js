import React from 'react';

import { StyleguideSection } from '../components';

export default function Typography() {
  return (
    <StyleguideSection name="typography" title="Typography">
      <div className="StyleguideTypography col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <h3>Semantic Hierarchy</h3>
            <p>A visual hierarchy should be established by correctly nesting headings.</p>
            {/* TODO: finish converting this table */}
            <table className="Table">
              <thead>
                <tr>
                  <th className="element">Element</th>
                  <th>Font Size</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="TableRow">
                  <td className="TableCell"><h1>Page Title</h1></td>
                  <td className="TableCell">
                    28px (2.8 rem)
                  </td>
                  <td className="TableCell">
                    The main page heading, <code>&lt;h1&gt;</code>,
                    should only be used once per page.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><h2>Heading</h2></td>
                  <td className="TableCell">
                    22px (2.2 rem)
                  </td>
                  <td className="TableCell">
                    The secondary heading, <code>&lt;h2&gt;</code>,
                    is a page-level heading. It can be used more than once per page.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td><h3>Third-level</h3></td>
                  <td className="TableCell">
                    18px; (1.8 rem); $font-large;
                  </td>
                  <td className="TableCell">
                    <code>&lt;h3&gt;</code>, to be used after <code>&lt;h2&gt;</code>.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><h4>Fourth-level</h4></td>
                  <td className="TableCell">
                    16px; (1.6 rem); $font-large;
                  </td>
                  <td className="TableCell">
                    <code>&lt;h4&gt;</code>, to be used after <code>&lt;h3&gt;</code>.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><h5>Fifth-level</h5></td>
                  <td className="TableCell">
                    15px; (1.5 rem): $font-normal;
                  </td>
                  <td className="TableCell">
                    <code>&lt;h5&gt;</code>, to be used after <code>&lt;h4&gt;</code>.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><h6>Sixth-level</h6></td>
                  <td className="TableCell">
                    15px; (1.5 rem): $font-normal;
                  </td>
                  <td className="TableCell">
                    <code>&lt;h6&gt;</code>, to be used after <code>&lt;h5&gt;</code>.
                  </td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><p>This is a paragraph.</p></td>
                  <td className="TableCell">
                    15px; (1.5 rem); $font-normal;
                  </td>
                  <td className="TableCell">
                    The paragraph <code>&lt;p&gt;</code>,
                    is the generic font for use where Headings and
                    other more specific tags are not applicable.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <h3>General Formatting</h3>
            <table className="Table">
              <thead>
                <tr>
                  <th className="element">Element</th>
                  <th>Font Size</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="TableRow">
                  <td className="TableCell"><strong>Bold Text</strong></td>
                  <td className="TableCell">15px; (1.5 rem); $font-normal;</td>
                  <td className="TableCell">Use the <code>&lt;strong&gt;</code> tag for <strong>Bold Text</strong></td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><em>Italic Text</em></td>
                  <td className="TableCell">15px; (1.5 rem); $font-normal;</td>
                  <td className="TableCell">Use the <code>&lt;em&gt;</code> tag for <em>Italic Text</em></td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><small>Small Text</small></td>
                  <td className="TableCell">12px; (1.2 rem); $font-small;</td>
                  <td className="TableCell">Use the <code>&lt;small&gt;</code> tag for <small>Small Text</small></td>
                </tr>
                <tr className="TableRow">
                  <td className="TableCell"><a href="#">Hyperlink</a></td>
                  <td className="TableCell">15px; (1.5 rem); $font-normal;</td>
                  <td className="TableCell">Links use $blue ( #4A90E2 ) and are only underlined on hover.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
