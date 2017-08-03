
module.exports = {
  defaultBranch: "master",
  defaultOrganization: "trufflesuite",
  defaultRemote: "origin",
  isDefaultOrg: function(orgName) {
    return orgName === this.defaultOrganization
  },
  isDefaultRemote: function(remoteName) {
    return remoteName === this.defaultRemote;
  },
  remoteForOrg: function(orgName) {
    return this.isDefaultOrg(orgName)
      ? this.defaultRemote
      : orgName;
  },
  remoteRef: function(remoteName, branchName) {
    return this.isDefaultRemote(remoteName)
      ? branchName
      : `${remoteName}/${branchName}`;
  }
};
