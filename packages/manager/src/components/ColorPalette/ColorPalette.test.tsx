import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ColorPalette } from './ColorPalette';

describe('Color Palette', () => {
  it('renders the Color Palette', () => {
    const { getAllByText, getByText } = renderWithTheme(<ColorPalette />);

    // primary colors
    getByText('Primary Colors');
    getByText('theme.palette.primary.main');
    const mainHash = getAllByText('#3683dc');
    expect(mainHash).toHaveLength(2);
    getByText('theme.palette.primary.light');
    getByText('#4d99f1');
    getByText('theme.palette.primary.dark');
    getByText('#2466b3');
    getByText('theme.palette.text.primary');
    const primaryHash = getAllByText('#606469');
    expect(primaryHash).toHaveLength(3);
    getByText('theme.color.headline');
    const headlineHash = getAllByText('#32363c');
    expect(headlineHash).toHaveLength(2);
    getByText('theme.palette.divider');
    const dividerHash = getAllByText('#f4f4f4');
    expect(dividerHash).toHaveLength(2);
    const whiteColor = getAllByText('theme.color.white');
    expect(whiteColor).toHaveLength(2);
    const whiteHash = getAllByText('#fff');
    expect(whiteHash).toHaveLength(3);

    // etc
    getByText('Etc.');
    getByText('theme.color.red');
    getByText('#ca0813');
    getByText('theme.color.orange');
    getByText('#ffb31a');
    getByText('theme.color.yellow');
    getByText('#fecf2f');
    getByText('theme.color.green');
    getByText('#00b159');
    getByText('theme.color.teal');
    getByText('#17cf73');
    getByText('theme.color.border2');
    getByText('#c5c6c8');
    getByText('theme.color.border3');
    getByText('#eee');
    getByText('theme.color.grey1');
    getByText('#abadaf');
    getByText('theme.color.grey2');
    getByText('#e7e7e7');
    getByText('theme.color.grey3');
    getByText('#ccc');
    getByText('theme.color.grey4');
    getByText('#8C929D');
    getByText('theme.color.grey5');
    getByText('#f5f5f5');
    getByText('theme.color.grey6');
    const borderGreyHash = getAllByText('#e3e5e8');
    expect(borderGreyHash).toHaveLength(3);
    getByText('theme.color.grey7');
    getByText('#e9eaef');
    getByText('theme.color.grey8');
    getByText('#dbdde1');
    getByText('theme.color.grey9');
    const borderGrey9Hash = getAllByText('#f4f5f6');
    expect(borderGrey9Hash).toHaveLength(3);
    getByText('theme.color.black');
    getByText('#222');
    getByText('theme.color.offBlack');
    getByText('#444');
    getByText('theme.color.boxShadow');
    getByText('#ddd');
    getByText('theme.color.boxShadowDark');
    getByText('#aaa');
    getByText('theme.color.blueDTwhite');
    getByText('theme.color.tableHeaderText');
    getByText('rgba(0, 0, 0, 0.54)');
    getByText('theme.color.drawerBackdrop');
    getByText('rgba(255, 255, 255, 0.5)');
    getByText('theme.color.label');
    getByText('#555');
    getByText('theme.color.disabledText');
    getByText('#c9cacb');
    getByText('theme.color.tagButton');
    getByText('#f1f7fd');
    getByText('theme.color.tagIcon');
    getByText('#7daee8');

    // background colors
    getByText('Background Colors');
    getByText('theme.bg.app');
    getByText('theme.bg.main');
    getByText('theme.bg.offWhite');
    getByText('#fbfbfb');
    getByText('theme.bg.lightBlue1');
    getByText('#f0f7ff');
    getByText('theme.bg.lightBlue2');
    getByText('#e5f1ff');
    getByText('theme.bg.white');
    getByText('theme.bg.tableHeader');
    getByText('#f9fafa');
    getByText('theme.bg.primaryNavPaper');
    getByText('#3a3f46');
    getByText('theme.bg.mainContentBanner');
    getByText('#33373d');
    getByText('theme.bg.bgPaper');
    getByText('#ffffff');
    getByText('theme.bg.bgAccessRow');
    getByText('#fafafa');
    getByText('theme.bg.bgAccessRowTransparentGradient');
    getByText('rgb(255, 255, 255, .001)');

    // typography colors
    getByText('Typography Colors');
    getByText('theme.textColors.linkActiveLight');
    getByText('#2575d0');
    getByText('theme.textColors.headlineStatic');
    getByText('theme.textColors.tableHeader');
    getByText('#888f91');
    getByText('theme.textColors.tableStatic');
    getByText('theme.textColors.textAccessTable');

    // border colors
    getByText('Border Colors');
    getByText('theme.borderColors.borderTypography');
    getByText('theme.borderColors.borderTable');
    getByText('theme.borderColors.divider');
  });
});
