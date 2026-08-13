import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
const envFlag = args.find(arg => arg.startsWith("--env="));
// Default to 'dev' if no flag is provided
const env = envFlag ? envFlag.split("=")[1] : 'dev';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageRoot = path.join(__dirname, "../packages/cloudpulse");
const pathToPackage = path.join(packageRoot, "package.json");

const file = fs.readFileSync(pathToPackage, "utf-8");
const pkg = JSON.parse(file);

const gitHash = execSync("git rev-parse --short HEAD", {
    encoding: "utf8",
}).trim();
const currentDate = execSync("date +%Y%m%dT%H%M%S", {
    encoding: "utf8",
}).trim();

const branch = (process.env.GIT_BRANCH || "").trim();
const isDev = branch === "develop";
const isStage = branch === "staging";
const isProd = branch === "master";

const build = () => {

    execSync("pnpm run build", {
        cwd: packageRoot,
        stdio: "inherit",
    });
};

// Fetches the currently published version for the given dist-tag.
const getPublishedVersion = (distTag) => {
    try {
        const publishedVersion = execSync(
            `npm view ${pkg.name}@${distTag} version`,
            { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
        ).trim();

        return publishedVersion || null;
    } catch (error) {
        // npm view exits non-zero if the package/tag doesn't exist yet
        return null;
    }
};

// Ensures the local package.json version has actually been bumped
// compared to whatever is currently published, so we never republish
// (or reuse) a version that's already out there.
const assertVersionIsBumped = (distTag) => {
    const publishedVersion = getPublishedVersion(distTag);
    const currentPackageVersion = pkg.version;

    if (publishedVersion && currentPackageVersion === publishedVersion) {
        console.log(
            `${pkg.name}: version ${currentPackageVersion} is already published. So skipping this step.`
        );
        process.exit(1);
    }
};

if (isDev || isStage) {
    assertVersionIsBumped("next");

    console.log("Publishing develop/staging:", pkg.version);
    const baseVersion = pkg.version.split("-")[0];
    pkg.version = `${baseVersion}-${env}-${currentDate}-${gitHash}`;

    fs.writeFileSync(pathToPackage, JSON.stringify(pkg, null, 2));
    build();

    execSync("pnpm publish --no-git-checks --tag next", {
        cwd: packageRoot,
        stdio: "inherit",
    });

} else if (isProd) {
    assertVersionIsBumped("latest");

    console.log("Publishing production:", pkg.version);

    build();

    execSync("pnpm publish --no-git-checks", {
        cwd: packageRoot,
        stdio: "inherit",
    });

} else {
    console.log("On branch:", branch, ", skipping publish");
}
