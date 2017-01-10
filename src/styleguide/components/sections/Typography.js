import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

export default function Typography() {
  return (
    <StyleguideSection name="typography" title="Typography">
      <div className="col-sm-12">
        <div className="Styleguide-sub-section row">
          <div className="col-sm-12">
            <h3>Semantic Heirarchy</h3>
            <p>A visual heirarchy should be established by correctly nesting headings.</p>
            <table>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Font Size</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><h1>H1</h1></td>
                  <td>
                    $font-large;  1.8rem;  ~28px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><h2>H2</h2></td>
                  <td>
                    $font-medium;  1.4rem;  ~22px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><h3>H3</h3></td>
                  <td>
                    $font-small;  1.2rem;  ~19px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><h4>H4</h4></td>
                  <td>
                    1.5rem;  24px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><h5>H5</h5></td>
                  <td>
                    1.25rem;  20px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><h6>H6</h6></td>
                  <td>
                    1rem;  16px;
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><p>This is a paragraph</p></td>
                  <td>
                    0.975rem;  ~15px;
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="Styleguide-sub-section row">
          <div className="col-sm-12">
            <h3>General Formatting</h3>
            <table>
              <thead>
              <tr>
                <th>Element</th>
                <th>Font Size</th>
                <th>Description</th>
              </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bold Text</strong></td>
                  <td>0.975rem; ~15px;</td>
                  <td>Use the <pre><code>&lt;strong&gt;</code></pre> tag for <strong>Bold Text</strong></td>
                </tr>
                <tr>
                  <td><em>Italic Text</em></td>
                  <td>0.975rem; ~15px;</td>
                  <td>Use the <pre><code>&lt;em&gt;</code></pre> tag for <em>Italic Text</em></td>
                </tr>
                <tr>
                  <td><small>Small Text</small></td>
                  <td>80%; ~12px;</td>
                  <td>Use the <pre><code>&lt;small&gt;</code></pre> tag for <small>Small Text</small></td>
                </tr>
                <tr>
                  <td><a href="#">Hyperlink</a></td>
                  <td>0.975rem; ~15px</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
