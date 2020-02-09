const { readFile, readdir, writeFile } = require("fs").promises;
const { toSlug } = require("./slug");
const path = require("path");

// https://github.com/sindresorhus/awesome-nodejs#command-line-utilities

const helpersDir = path.resolve(__dirname, "..", "tools");

async function getHelpers() {
  const helpers = Object.values({
    ...(await getHelpersFromHelpersJSON())
    // ...(await getHelpersFromFiles())
  });
  helpers.sort((a, b) =>
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  );

  return helpers;
}

async function getHelpersFromHelpersJSON() {
  // TODO: Remove me when all PRs targeting helpers.json have been merged!
  //       See https://github.com/stefanjudis/tiny-helpers/pull/49#issuecomment-575203628
  const helpers = require("../tools.json");

  return Object.fromEntries(helpers.map(h => [h.name, h]));
}

async function getHelpersFromFiles() {
  const files = (await readdir(helpersDir)).filter(name =>
    name.endsWith(".json")
  );
  const texts = await Promise.all(
    files.map(name => readFile(path.join(helpersDir, name)))
  );
  const helpers = texts.map(text => JSON.parse(text));

  return Object.fromEntries(helpers.map(h => [h.name, h]));
}

async function writeHelper(helper) {
  const filePath = path.join(helpersDir, `${toSlug(helper.name)}.json`);
  const data = JSON.stringify(helper, null, 2) + "\n";
  await writeFile(filePath, data);
  return filePath;
}

function getTags(helpers) {
  const tags = require("../categories.json").map(tag => tag.name);

  return tags.sort((a, b) => (a < b ? -1 : 1));
}

module.exports.getTags = getTags;
module.exports.getHelpers = getHelpers;
module.exports.helpersDir = helpersDir;
module.exports.writeHelper = writeHelper;