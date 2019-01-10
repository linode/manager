const { readFileSync, writeFileSync } = require('fs');
var resemble = require('resemblejs');
const { createAttachment } = require('wdio-allure-reporter');

const VISUAL_REGRESSION = process.env['VISUAL_REGRESSION'];
const BASELINE = './e2e/visual-regression/baseline';
const SCREENSHOT = './e2e/visual-regression/screenshots';
const SAVEPATH = VISUAL_REGRESSION ? SCREENSHOT : BASELINE;

const compareToBaseLine = (imageName) => {
    const baselineImg = readFileSync(`${BASELINE}/${imageName}.png`);
    const screenImg = readFileSync(`${SCREENSHOT}/${imageName}.png`);
    resemble(screenImg).compareTo(baselineImg).outputSettings({
        errorColor: {
            red: 255,
            green: 0,
            blue: 255
        },
        errorType: "movement",
        transparency: 0.1,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true
    }).onComplete((compareData) => {
        if(compareData.rawMisMatchPercentage > 0){
            createAttachment(`Expected Image: ${imageName}`,baselineImg,'image/png');
            createAttachment(`Actual Image: ${imageName}`,screenImg,'image/png');
            createAttachment(`Diff Image: ${imageName}`,compareData.getBuffer(),'image/png');
            expect(false).toBe(true);
        } else {
            createAttachment(`Expected Image: ${imageName}`,baselineImg,'image/png');
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
