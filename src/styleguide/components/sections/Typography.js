import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

export default function Typography() {
  return (
    <StyleguideSection name="typography" title="Typography">
      <div className="StyleguideTypography col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <h3>Semantic Hierarchy</h3>
            <p>A visual hierarchy should be established by correctly nesting headings.</p>
            <table>
              <thead>
                <tr>
                  <th className="element">Element</th>
                  <th>Font Size</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><h1>Page Title</h1></td>
                  <td>
                    28px (2.8 rem)
                  </td>
                  <td>
                    The main page heading, <code>&lt;h1&gt;</code>,
                    should only be used once per page.
                  </td>
                </tr>
                <tr>
                  <td><h2>Heading</h2></td>
                  <td>
                    22px (2.2 rem)
                  </td>
                  <td>
                    The secondary heading, <code>&lt;h2&gt;</code>,
                    is a page-level heading. It can be used more than once per page.
                  </td>
                </tr>
                <tr>
                  <td><h3>Third-level</h3></td>
                  <td>
                    18px; (1.8 rem); $font-large;
                  </td>
                  <td>
                    <code>&lt;h3&gt;</code>, to be used after <code>&lt;h2&gt;</code>.
                  </td>
                </tr>
                <tr>
                  <td><h4>Fourth-level</h4></td>
                  <td>
                    16px; (1.6 rem); $font-large;
                  </td>
                  <td>
                    <code>&lt;h4&gt;</code>, to be used after <code>&lt;h3&gt;</code>.
                  </td>
                </tr>
                <tr>
                  <td><h5>Fifth-level</h5></td>
                  <td>
                    15px; (1.5 rem): $font-normal;
                  </td>
                  <td>
                    <code>&lt;h5&gt;</code>, to be used after <code>&lt;h4&gt;</code>.
                  </td>
                </tr>
                <tr>
                  <td><h6>Sixth-level</h6></td>
                  <td>
                    15px; (1.5 rem): $font-normal;
                  </td>
                  <td>
                    <code>&lt;h6&gt;</code>, to be used after <code>&lt;h5&gt;</code>.
                  </td>
                </tr>
                <tr>
                  <td><p>This is a paragraph.</p></td>
                  <td>
                    15px; (1.5 rem); $font-normal;
                  </td>
                  <td>
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
            <table>
              <thead>
                <tr>
                  <th className="element">Element</th>
                  <th>Font Size</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bold Text</strong></td>
                  <td>15px; (1.5 rem); $font-normal;</td>
                  <td>Use the <code>&lt;strong&gt;</code> tag for <strong>Bold Text</strong></td>
                </tr>
                <tr>
                  <td><em>Italic Text</em></td>
                  <td>15px; (1.5 rem); $font-normal;</td>
                  <td>Use the <code>&lt;em&gt;</code> tag for <em>Italic Text</em></td>
                </tr>
                <tr>
                  <td><small>Small Text</small></td>
                  <td>12px; (1.2 rem); $font-small;</td>
                  <td>Use the <code>&lt;small&gt;</code> tag for <small>Small Text</small></td>
                </tr>
                <tr>
                  <td><a href="#">Hyperlink</a></td>
                  <td>15px; (1.5 rem); $font-normal;</td>
                  <td>Links use $blue ( #4A90E2 ) and are only underlined on hover.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
