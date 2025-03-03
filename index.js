const path = require("path");
const fs = require("fs");
const CONSTANTS = require(path.join(__dirname, "CONSTANTS"));
const { By, until } = require("selenium-webdriver");

/**
 * Reads and encodes file into base64
 * @param {String} file
 * @returns The file bytes converted into base64
 */
function encodeFile(file) {
  const stream = fs.readFileSync(file);
  return Buffer.from(stream).toString("base64");
}

/**
 * Returns base64 encoded Requestly extension which can be added to selenium browser
 * @param {"chrome" | "firefox" | "MicrosoftEdge"} browser Name of the browser for which extension is needed
 * @returns Encoded Extension
 */
function getRequestlyExtension(browser) {
  switch (browser) {
    case CONSTANTS.BROWSERS.FIREFOX:
      return path.join(
        __dirname,
        CONSTANTS.EXTENSION_FOLDER,
        CONSTANTS.REQUESTLY_FIREFOX_EXTENSION
      );

    case CONSTANTS.BROWSERS.CHROME:
    case CONSTANTS.BROWSERS.EDGE:
      return encodeFile(
        path.join(
          __dirname,
          CONSTANTS.EXTENSION_FOLDER,
          CONSTANTS.REQUESTLY_CHROMIUM_EXTENSION
        )
      );

    default:
      throw "Missing Browser Name";
  }
}

/**
 * Imports shared-list to user rules in requestly
 * @param {Object} driver selenium-webdriver instance
 * @param {String} sharedListUrl Requestly SharedList Url to be imported
 */
const importRequestlySharedList = async (driver, sharedListUrl) => {
  const tabs = await driver.getAllWindowHandles();
  // Switch to /rules which gets opened after installation of extension because
  // The focus is by default on the 1st tab opened.
  if (tabs.length > 1) {
    await driver.switchTo().window(tabs[0]);
    // Close the /rules tab
    await driver.close();
    // Switch to the 1st tab(default)
    await driver.switchTo().window(tabs[1]);
  }
  // Open Page Url
  await driver.get(sharedListUrl);
  // Condition for wait till Import List button is located
  const condition = until.elementsLocated(
    By.css(CONSTANTS.IMPORT_LIST_BUTTON_CLASS)
  );
  // Wait until Import List button gets loaded
  await driver.wait(
    async (driver) => condition.fn(driver),
    10000,
    "Loading Timeout"
  );
  // Click on import List button
  await driver.findElement(By.css(CONSTANTS.IMPORT_LIST_BUTTON_CLASS)).click();
};

module.exports = {
  getRequestlyExtension,
  importRequestlySharedList,
};
