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

if (isDev || isStage) {
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

    console.log("Publishing production:", pkg.version);

    build();

    execSync("pnpm publish --no-git-checks", {
        cwd: packageRoot,
        stdio: "inherit",
    });

} else {
    console.log("On branch:", branch, ", skipping publish");
}