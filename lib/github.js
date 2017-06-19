var GitHubApi = require("github");
var indent = require("./indent");
var github = new GitHubApi();

module.exports = {
  repositories: function(organization) {
    return github.repos.getForOrg({
     org: organization,
     per_page: 200
   });
  }
}
