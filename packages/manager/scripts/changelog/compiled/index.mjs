/******/ var __webpack_modules__ = ({

/***/ 628:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(628);


const runChangesetBot = async () => {
  const { OWNER, REPO, PR_NUMBER, TOKEN } = process.env;

  try {
    /**
     * We need to fetch all the inputs that were provided to our action
     * and store them in variables for us to use.
     **/
    const inputs = {
      owner: OWNER,
      repo: REPO,
      pull_number: PR_NUMBER,
      token: TOKEN,
    };
    const octokit = new _actions_github__WEBPACK_IMPORTED_MODULE_0__.getOctokit(inputs.token);

    /**
     * We need to fetch the PR data from GitHub so we can check if the PR has a changeset.
     */
    const PrData = await getCurrentPR(inputs, octokit);

    /**
     * Check if the PR contains a reference to a changeset
     */
    const hasChangesetBotComment = PrData?.includes(`pr-${inputs.pull_number}`);
    const comment = hasChangesetBotComment
      ? `:heavy_check_mark: **Changeset Found!**\n\nCarry on!`
      : `:warning: **No Changeset Found**\n\nPR #${inputs.pull_number} does not have a changeset.\nNot every PR needs one, but if this PR is a user-facing change, or is relevant to an "Added", "Fixed", "Changed", "Removed" or "Tech Stories" type, please consider adding one by running \`yarn changeset\``;

    /**
     * Fetch the comments from GitHub and check if the bot has already commented on the PR.
     */
    const comments = await listComments(inputs, octokit);
    const hasChangeset = comments.find((comment) =>
      comment.body.includes('Changeset Found')
    );

    await handleComment(inputs, octokit, hasChangeset, comment);
  } catch (error) {
    console.warn(`An error occurred trying to check for a changeset: ${error}`);
  }
};

const getCurrentPR = async (inputs, octokit) => {
  const { owner, repo, pull_number } = inputs;

  try {
    const { data: PrData } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });

    return PrData;
  } catch (error) {
    console.warn(`Error fetching PR data: ${error}`);
  }
};

const listComments = async (inputs, octokit) => {
  const { owner, repo, pull_number } = inputs;

  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
    });

    return comments;
  } catch (error) {
    console.warn(`Error fetching comments: ${error}`);
  }
};

const handleComment = async (inputs, octokit, hasChangeset, comment) => {
  try {
    const { owner, repo, pull_number } = inputs;
    /**
     * If the bot has already commented on the PR, we need to update the comment with the new message,
     * else we need to create a new comment.
     */
    if (hasChangeset) {
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: hasChangeset.id,
        body: comment,
      });
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: comment,
      });
    }
  } catch (error) {
    console.warn(`Error posting/updating comments: ${error}`);
  }
};

runChangesetBot();

})();

