var github = require("github");

module.exports = {
  allRepos: function(organization) {
    return github.repos.getForOrg({
      org: organization,
      per_page: 200
    });
  }
}
