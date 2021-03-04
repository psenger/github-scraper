const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const {exec} = require('child_process');
const {Parser, transforms: {unwind}} = require('json2csv');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const outFile = process.env['GITHUB-OUTFILE'] || 'data.json';
const csvFile = process.env['GITHUB-CSVFILE'] || 'data.csv';
const inventoryFile = process.env['GITHUB-INVENTORY'] || '';
const skipNames = Array.from(new Set((process.env['GITHUB-SKIP-NAMES'] || '').split(','))).map(v => v.trim()).filter(v => v.length !== 0);

if (!fs.existsSync(path.join(__dirname, 'out')) || !fs.existsSync(path.join(__dirname, 'out', outFile))) {
    throw new Error(`Missing "./out/${outFile}" run scraper first`);
}

const extractBranchDetails = (s) => {
    const result = s.match(/Your branch is up to date with '(.*)'/, 'g');

    if (result && result.length === 2) {
        return result[1];
    } else {
        throw new Error(`Required branch details missing\n${s}`);
    }
}
const dockerPattern = /.+\/Dockerfile/g;
const isDockerFile = str => dockerPattern.test(str);
const extractDockerFrom = content => {
    const result = content.match(/^FROM\s+(.*)\s*$/m)
    if (result && result.length === 2) {
        return result[1]
    } else {
        return 'Dockerfile FROM missing';
    }
}
const walk = function walk(dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};
const asyncWalk = async (dir) => new Promise((resolve, reject) => {
    walk(dir, (error, results) => {
        if (error) {
            return reject(error);
        }
        resolve(results)
    });
});
const refreshDataDir = async function refreshDataDir(repo) {
    return new Promise((resolve, reject) => {
        exec(`rm -rf data; mkdir data`, {}, (e, stdout, stderr) => {
            if (e) {
                console.error(e);
                return reject(stderr)
            }
            resolve((stdout || '').toString('utf-8'))
        })
    })
};
const cloneRepo = async function cloneRepo(clone_url, default_branch) {
    return new Promise((resolve, reject) => {
        exec(`git clone --branch ${default_branch} ${clone_url} data`, {}, (e, stdout, stderr) => {
            if (e) {
                console.error(e);
                return reject(stderr)
            }
            resolve((stdout || '').toString('utf-8'))
        })
    })
};
const validateBranch = async function validateBranch(repo) {
    return new Promise((resolve, reject) => {
        exec(`cd data && git status && cd ..`, {}, (e, stdout, stderr) => {
            if (e) {
                console.error(e);
                return reject(stderr)
            }
            resolve((stdout || '').toString('utf-8'))
        })
    })
};
(async function () {
    const inventory = [];
    const data = require(`./out/${outFile}`);
    for (let i = 0; i < data.length; i++) {
        const {default_branch, clone_url, name, owner, svn_url} = data[i];
        let file_cnt = 0;
        let skipped = false;
        let builds = [];
        if (skipNames.some((v) => v === name)) {
            console.log(`skipping ${name}`);
            file_cnt = 0;
            skipped = true;
        } else {
            console.log(`cloning ${name}`);
            const resultsRefreshDataDir = await refreshDataDir();
            const resultsCloneRepo = await cloneRepo(clone_url, default_branch);
            const resultsValidateBranch = await validateBranch();
            console.log(`branch ${extractBranchDetails(resultsValidateBranch)}`);
            const files = await asyncWalk(path.join(__dirname, 'data'))
            console.log(`files count ${files.length}`);
            const dockerFiles = await Promise.all(
                files
                    .filter((file) => isDockerFile(file))
                    .map(async (file) => {
                        return readFile(file, 'utf-8');
                    })
            );
            builds = dockerFiles.map(content => extractDockerFrom(content))
            // const dockerfiles = files.filter((file) => isDockerFile(file)).map((file)=>{
            //     return file.replace(path.join(__dirname,'data'),'');
            // })
            file_cnt = files.length;
            skipped = false;
        }
        inventory.push({
            default_branch, clone_url, name, owner, svn_url, builds, file_cnt, skipped
        })
    }
    const fields = ['name', 'owner.login', 'svn_url', 'skipped', 'clone_url', 'default_branch', 'file_cnt', 'builds'];
    const transforms = [unwind({paths: ['builds']})];
    const parser = new Parser({fields, transforms});
    const csv = parser.parse(inventory);
    await writeFile(path.join(__dirname, 'out', inventoryFile), csv, 'utf-8');
})();
