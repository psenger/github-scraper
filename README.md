# github-scraper

github-scraper is used to scan repos owned by an org, clone them locally, look for a Dockerfile, 
and extract the `FROM (build)` into a nice CSV for management to use in its reports, or to find
a container that is running at the wrong version without asking the Dev Ops guys.

- [github-scraper](#github-scraper)
    * [Additional Docs](#additional-docs)
    * [Variables](#variables)

## Additional Docs

Must refer to [OctoKit](https://octokit.github.io/rest.js/v18)

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
| GITHUB-INVENTORY  	| false    	| /data/inventory.csv 	| the results of scanning files in github ( in this repo it is the Dockerfile FROM command )                                                                                                                                                                                                           	|
| GITHUB-SKIP-NAMES 	| false    	| ''                  	| any repos you want to skip while building the inventory.                                                                                                                                                                                                                                             	|
