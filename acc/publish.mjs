import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
const envFlag = args.find(arg => arg.startsWith("--env="));
const env = envFlag ? envFlag.split("=")[1] : '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPackage = path.join(
  __dirname,
  "../packages/manager/package.json",
);
const file = fs.readFileSync(pathToPackage, "utf-8");
const pkg = JSON.parse(file);

const gitHash = execSync("git rev-parse --short HEAD", {
  encoding: "utf8",
}).trim();
const currentDate = execSync("date +%Y%m%dT%H%M%S", {
  encoding: "utf8",
}).trim();

// uses a variable that we know exists on jenkins: https://wiki.jenkins.io/display/JENKINS/Git+Plugin
const branch = (process.env.GIT_BRANCH || "").trim();
const isDev = branch === "develop";
const isStage = branch === "staging";
const isProd = branch === "master";

if (isDev || isStage) {
  console.log("Publishing develop:", pkg.version);
  pkg.version = `${pkg.version.split("-")[0]}-${env}-${currentDate}-${gitHash}`;
  fs.writeFileSync(pathToPackage, JSON.stringify(pkg, null, 2));
  execSync("pnpm publish --no-git-checks", {
    cwd: path.join(__dirname, "../packages/manager"),
    stdio: "inherit",
  });
} else if (isProd) {
  console.log("Publishing master:", pkg.version);
  execSync("pnpm publish --no-git-checks", {
    cwd: path.join(__dirname, "../packages/manager"),
    stdio: "inherit",
  });
} else {
  console.log("On branch:", branch, ", skipping publish");
}