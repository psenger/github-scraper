const {Octokit} = require("@octokit/rest");
const path = require('path');
const fs = require('fs');
const {name,version} = require('./package.json');

const isRequired = msg => {
    throw new Error(`Required environment variable, "${msg}" is missing`);
}

const token = process.env['GITHUB-PAL-TOKEN'] || isRequired('GITHUB-PAL-TOKEN');
const timeZone = process.env['GITHUB-TIMEZONE'] || isRequired('GITHUB-TIMEZONE');
const org = process.env['GITHUB-ORG'] || isRequired('GITHUB-ORG');
const type = process.env['GITHUB-TYPE'] || isRequired('GITHUB-TYPE');
const outFile = process.env['GITHUB-OUTFILE'] || 'data.json';

// make the directory if it does not exist.
if (!fs.existsSync(path.join(__dirname,'out'))){
    fs.mkdirSync(path.join(__dirname,'out'));
}

const extractNextPage = link => {
    const result = link.match(/<([A-z:.=\/?&0-9]+)>;\s+rel="next"/i);
    let nextUrl = '';
    if ( result && result.length === 2 ) {
        nextUrl = result[1]
    } else {
        return false;
    }
    const result2 = nextUrl.match(/page=(\d+)/i)
    if ( result2 && result2.length === 2) {
        return result2[1]
    } else {
        return false;
    }
}

const allData = [];

(async function () {

    const octokit = new Octokit({
        auth: `${token}`,
        userAgent: `${name} v${version}`,
        previews: [],
        timeZone: `${timeZone}`,
        baseUrl: 'https://api.github.com',
        log: {
            debug: () => {
            },
            info: () => {
            },
            warn: console.warn,
            error: console.error
        },
        request: {
            agent: undefined,
            fetch: undefined,
            timeout: 0
        }
    });

    let page = "1";
    do {
        console.log(`extracting page #${page}`);
        // Compare: https://docs.github.com/en/rest/reference/repos/#list-organization-repositories
        const x = await octokit.repos
            .listForOrg({
                org,
                type,
                page
            });
        const {data, headers,} = x;
        page = extractNextPage(headers.link);
        data.forEach((v) => {
            allData.push(v)
        })
    } while (page !== false);
    fs.writeFileSync(path.join(__dirname, 'out', outFile), JSON.stringify(allData, null, 4));
})()
