const { resemblejs } = require('resemblejs');
const { readFileSync, writeFileSync } = require('fs');

const VISUAL_REGRESSION = process.env['VISUAL_REGRESSION'];
const BASELINE = './e2e/visual-regression/baseline';
const SCREENSHOT = './e2e/visual-regression/screenshots';
const SAVEPATH = VISUAL_REGRESSION ? SCREENSHOT : BASELINE;

const compareToBaseLine = (imageName) => {
    const screenImg = readFileSync(`${BASELINE}/${imageName}.png`);
    const baselineImg = readFileSync(`${SCREENSHOT}/${imageName}.png`);
    resemble(screenImg).compareTo(baselineImg)
        .onComplete((compareData) => {
            console.log(compareData);
            if(compareData.rawMisMatchPercentage > 0){
                writeFileSync(`./errorShots/${imageName}.png`, compareData.getBuffer());
                expect(false).toBe(true);
            }
        });
}

const takeScreenshot = (element,selector) => {
    selector ? browser.saveElementScreenshot(`${SAVEPATH}/${element}.png`, selector) :
      browser.saveViewportScreenshot(`${SAVEPATH}/${element}.png`);
}

export const compareTest = (imageName,selector) => {
    takeScreenshot(imageName,selector);
    if(VISUAL_REGRESSION){
        compareToBaseLine(imageName);
    }
}
