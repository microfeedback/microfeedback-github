require('dotenv').config();
const assert = require('assert');

const parseGH = require('parse-github-repo-url');
const parseUserAgent = require('ua-parser-js');
const truncate = require('truncate');
const table = require('markdown-table');
const axios = require('axios');
const mustache = require('mustache');
const { createError } = require('micro');
const wishes = require('micro-wishes');
const pkg = require('./package.json');

const { GH_REPO, GH_TOKEN } = process.env;
assert(GH_REPO, 'GH_REPO not set');
assert(GH_TOKEN, 'GH_TOKEN not set');

const [username, repoName] = parseGH(GH_REPO);
const GH_URL = `https://api.github.com/repos/${username}/${repoName}/issues`;

const HEADER_WHITELIST = ['user-agent', 'origin', 'referer'];

const makeTable = (headers, entries, sort = true) => {
  if (!entries.length) {
    return '';
  }
  const ret = [headers];
  const orderedEntries = sort ? entries.sort((a, b) => a[0] > b[0]) : entries;
  orderedEntries.forEach((each) => {
    ret.push(each);
  });
  return table(ret);
};

const issueTemplate = `
:bulb: New feedback was posted{{suffix}}

## Feedback

{{body}}

{{#screenshotURL}}
## Screenshot

![Screenshot]({{&screenshotURL}})
{{/screenshotURL}}

<details><summary>Client Details</summary<p>

{{#headerTable}}
### Headers

{{&headerTable}}
{{/headerTable}}

{{#browserTable}}
### Browser

{{&browserTable}}
{{/browserTable}}

{{#osTable}}
### Operating System

{{&osTable}}
{{/osTable}}

{{#extraTable}}
### Extra information

{{&extraTable}}
{{/extraTable}}

</p></details>

Reported via *[{{pkg.name}}]({{&pkg.repository}}) v{{pkg.version}}*.
`;
mustache.parse(issueTemplate);

const makeIssue = ({ body, extra, screenshotURL }, req) => {
  let suffix = '';
  if (req && req.headers.referer) {
    suffix = ` on ${req.headers.referer}`;
  }
  const view = { suffix, body, extra, screenshotURL, pkg };
  const title = `[wishes] New feedback${suffix}: "${truncate(body, 25)}"`;
  // Format headers as table
  if (req && req.headers) {
    const entries = Object.entries(req.headers).filter(
      e => HEADER_WHITELIST.indexOf(e[0]) >= 0
    );
    view.headerTable = makeTable(['Header', 'Value'], entries);
  }
  // Format user agent info as table
  if (req && req.headers && req.headers['user-agent']) {
    const userAgent = parseUserAgent(req.headers['user-agent']);
    const browserEntries = Object.entries(userAgent.browser).filter(e => e[1]);
    view.browserTable = makeTable(['Key', 'Value'], browserEntries, false);
    const osEntries = Object.entries(userAgent.os).filter(e => e[1]);
    view.osTable = makeTable(['Key', 'Value'], osEntries, false);
  }
  // Format extra information as table
  if (extra) {
    view.extraTable = makeTable(['Key', 'Value'], Object.entries(extra));
  }
  return { title, body: mustache.render(issueTemplate, view) };
};

const GitHubBackend = async (input, req) => {
  try {
    const { data } = await axios({
      method: 'POST',
      url: GH_URL,
      params: {
        access_token: GH_TOKEN,
      },
      data: makeIssue(input, req),
    });
    return data;
  } catch (err) {
    const { status, data } = err.response;
    throw new createError(status, data.message, err);
  }
};

module.exports = wishes(GitHubBackend, {
  name: 'github',
  version: pkg.version,
});
Object.assign(module.exports, { GitHubBackend, GH_URL, makeIssue });
