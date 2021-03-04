const path = require('path');
const fs = require('fs');

const outFile = process.env['GITHUB-OUTFILE'] || 'data.json';
const csvFile = process.env['GITHUB-CSVFILE'] || 'data.csv';

if (!fs.existsSync(path.join(__dirname, 'out')) || !fs.existsSync(path.join(__dirname, 'out', outFile))) {
    throw new Error(`Missing "./out/${outFile}" run scraper first`);
}

const data = require(`./out/${outFile}`);

let string = 'name\towner\tclone_url\tdefault_branch\n';
data.forEach((repo) => {
    console.log(repo.name, repo.owner.login, repo.clone_url, repo.default_branch);
    string += `${repo.name}\t${repo.owner.login}\t${repo.clone_url}\t${repo.default_branch}\n`;
})

fs.writeFileSync(path.join(__dirname, 'out', csvFile), string);
