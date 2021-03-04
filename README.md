# github-scraper

- [github-scraper](#github-scraper)
    * [Purpose](#purpose)
    * [Running](#running)
    * [Additional Docs](#additional-docs)
    * [Variables](#variables)
    * [Todo](#todo)
  
## Purpose

github-scraper is used to scan repos owned by an org, clone them locally, look for a Dockerfile,
extract the `FROM (build)` value into a nice CSV for management to use in its reports, or to find
a container that is running at the wrong version without asking the Dev Ops guys to do it.

| Script                | Purpose                                                                                                                                                                                                       |
|---------------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scraper.js`          | Pulls all the repo data belonging to the org ( as defined by type ) and stores the data in a file `./data/<GITHUB-OUTFILE>`. This file drives everything else.                                                |
| `build-masterlist.js` | This just reads `./data/<GITHUB-OUTFILE>` and builds a CSV file `./data/<GITHUB-CSVFILE>`                                                                                                                     |
| `build-inventory.js`  | Removes the directory `./out/` which will be the clone directory, once cloned, scans all files for a `Dockerfile`, reads them, and extracts `^FROM\s+(.*)\s*$` to a report called `./data/<GITHUB-INVENTORY>` |

## Running

**Required**

* `A good internetnet connection`
* `Node 15`

**Steps**

1. from the command prompt run `npm install`
2. create a *[`.env`](https://github.com/motdotla/dotenv#readme)* file  with the environment variables listed in [Variables](#variables)
3. from the command prompt run `npm run build-masterlist`
4. from the command prompt run `npm run scraper`
5. from the command prompt run `npm run build-inventory`
6. send your report to your boss, and then drink some coffee or reach out to me Philip A Senger <philip.a.senger@cngrgroup.com> for a job.

## Additional Docs

Refer to [OctoKit](https://octokit.github.io/rest.js/v18) for the Git hub api.

Refer to [dotenv](https://github.com/motdotla/dotenv#readme) for a better understanding of `.env` files

Refer to [Github Guides](https://guides.github.com/) for Github

Refer to [Docker Docs](https://docs.docker.com/) for Docker

## Variables

This project uses `.env`

| Variable          	| Required 	| Default             	| Purpose                                                                                                                                                                                                                                                                                              	|
|-------------------	|----------	|---------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| GITHUB-PAL-TOKEN  	| true     	|                     	| Personal access token ([create](https://github.com/settings/tokens/new))                                                                                                                                                                                                                             	|
| GITHUB-TIMEZONE   	| true     	|                     	| The time zone ([list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones))                                                                                                                                                                                                                 	|
| GITHUB-ORG        	| true     	|                     	| The org to scan in the repos                                                                                                                                                                                                                                                                         	|
| GITHUB-TYPE       	| true     	|                     	| Specifies the types of repositories you want returned. Can be one of all, public, private, forks, sources, member, internal. Default: all. If your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+, type can also be internal. 	|
| GITHUB-CSVFILE    	| false    	| ./data/data.csv     	| Builds a CSV master list file ( when build-masterlist is executed )                                                                                                                                                                                                                                  	|
| GITHUB-OUTFILE    	| false    	| ./data/data.json    	| Output from the scraper command, a full listing from github.                                                                                                                                                                                                                                         	|
| GITHUB-INVENTORY  	| false    	| ./data/inventory.csv 	| the results of scanning files in github ( in this repo it is the Dockerfile FROM command )                                                                                                                                                                                                           	|
| GITHUB-SKIP-NAMES 	| false    	| ''                  	| any repos you want to skip while building the inventory.                                                                                                                                                                                                                                             	|

## Todo

* The environment variables and expected chaining of data files is problematic.
* Might be nice to scan for repos owned by owners and or orgs.
* I think extracting the shell commands would be good, so you can make the code more reusable
* Naming convention is not so good. 
* linting and tests would be good.
* update `build-masterlist` to use the csv module and extract fields to environment variables.
* change `GITHUB-ORG` so it is defaulted to `all`
