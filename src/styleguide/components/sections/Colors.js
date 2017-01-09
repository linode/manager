import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

export default function Colors() {
  return (
<<<<<<< HEAD
    <StyleguideSection name="colors" title="Colors">
      <p></p>
    </StyleguideSection>
=======
    <Section name="colors" title="Color Pallete">
      <div className="col-sm-12">
        <div className="row">
          <div className="col-sm-6">
            {/* Greys */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__light-gray"></div>
                <div className="Color-block Color-block__gray"></div>
                <div className="Color-block Color-block__dark-gray"></div>
              </div>
              <div className="Color-block-details">
                <div className="Color-block-detail">
                  <div>$light-gray</div>
                  <div>#FBFBFB</div>
                </div>
                <div className="Color-block-detail">
                  <div>$gray</div>
                  <div>#F3F3F3</div>
                </div>
                <div className="Color-block-detail">
                  <div>$dark-gray</div>
                  <div>#DDDDDD</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Blacks */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__lightest-black"></div>
                <div className="Color-block Color-block__light-black"></div>
                <div className="Color-block Color-block__black"></div>
              </div>
              <div className="Color-block-details">
                <div className="Color-block-detail">
                  <div>$lightest-black</div>
                  <div>#ACACAC</div>
                </div>
                <div className="Color-block-detail">
                  <div>$light-black</div>
                  <div>#777</div>
                </div>
                <div className="Color-block-detail">
                  <div>$black</div>
                  <div>#4b4b4b</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            {/* Blues */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__light-blue"></div>
                <div className="Color-block Color-block__blue"></div>
                <div className="Color-block Color-block__dark-blue"></div>
              </div>
              <div className="Color-block-details">
                <div className="Color-block-detail">
                  <div>$light-blue</div>
                  <div>#DEEFF5</div>
                </div>
                <div className="Color-block-detail">
                  <div>$blue</div>
                  <div>#4A90E2</div>
                </div>
                <div className="Color-block-detail">
                  <div>darken($blue, 10%)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Greens */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__green"></div>
              </div>
              <div className="Color-block-details">
                <div className="Color-block-detail">
                  <div>$green</div>
                  <div>#38D377</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            {/* Reds */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__red"></div>
              </div>
              <div className="card-block Color-block-details">
                <div className="Color-block-detail">
                  <div>$red</div>
                  <div>#F24C2B</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Yellows */}
            <div className="Color">
              <div>
                <div className="Color-block Color-block__yellow"></div>
                <div className="Color-block Color-block__dark-yellow"></div>
                <div className="Color-block Color-block__darkest-yellow"></div>
              </div>
              <div className="card-block Color-block-details">
                <div className="Color-block-detail">
                  <div>$yellow</div>
                  <div>#FFFCF0</div>
                </div>
                <div className="Color-block-detail">
                  <div>$dark-yellow</div>
                  <div>darken($yellow, 20)</div>
                </div>
                <div className="Color-block-detail">
                  <div>$darkest-yellow</div>
                  <div>darken($yellow, 40)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
>>>>>>> colors wip
  );
}
