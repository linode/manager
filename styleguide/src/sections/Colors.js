import React from 'react';

import { StyleguideSection } from '../components';

export default function Colors() {
  return (
    <StyleguideSection name="colors" title="Color Pallete">
      <div className="col-sm-12">
        <div className="row">
          <div className="col-sm-6">
            {/* Greys */}
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__light-gray"></div>
                <div className="StyleguideColor-block StyleguideColor-block__gray"></div>
                <div className="StyleguideColor-block StyleguideColor-block__dark-gray"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
                  <div>$light-gray</div>
                  <div>#FBFBFB</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$gray</div>
                  <div>#F3F3F3</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$dark-gray</div>
                  <div>#DDDDDD</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Blacks */}
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__lightest-black"></div>
                <div className="StyleguideColor-block StyleguideColor-block__light-black"></div>
                <div className="StyleguideColor-block StyleguideColor-block__black"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
                  <div>$lightest-black</div>
                  <div>#ACACAC</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$light-black</div>
                  <div>#777</div>
                </div>
                <div className="StyleguideColor-block-detail">
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
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__light-blue"></div>
                <div className="StyleguideColor-block StyleguideColor-block__blue"></div>
                <div className="StyleguideColor-block StyleguideColor-block__dark-blue"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
                  <div>$light-blue</div>
                  <div>#DEEFF5</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$blue</div>
                  <div>#4A90E2</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>darken($blue, 10%)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Greens */}
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__green"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
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
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__red"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
                  <div>$red</div>
                  <div>#F24C2B</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            {/* Yellows */}
            <div className="StyleguideColor">
              <div>
                <div className="StyleguideColor-block StyleguideColor-block__yellow"></div>
                <div className="StyleguideColor-block StyleguideColor-block__dark-yellow"></div>
                <div className="StyleguideColor-block StyleguideColor-block__darkest-yellow"></div>
              </div>
              <div className="StyleguideColor-block-details">
                <div className="StyleguideColor-block-detail">
                  <div>$yellow</div>
                  <div>#FFFCF0</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$dark-yellow</div>
                  <div>darken($yellow, 20)</div>
                </div>
                <div className="StyleguideColor-block-detail">
                  <div>$darkest-yellow</div>
                  <div>darken($yellow, 40)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
