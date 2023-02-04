const compose = require("docker-compose");
const dockers = require("../models/dockerModel");
const path = require("path");
const cron = require("node-cron");
const fs = require("fs");
const simpleGit = require("simple-git");
const { fromUrl } = require("hosted-git-info");

const progress = new Map();

// Cron Job to check if docker containers should be stopped
// cron.schedule('*/5 * * * *', () => {
//     challenges.find({}).then((allChallenges) => {
//         allChallenges.forEach(challenge => {
//             challenge.dockerLaunchers.forEach(async launcher => {
//                 if (Date.now() - launcher.startTime >= (1000 * 60 * 60) * 2) {
//                     compose.down({ cwd: path.join(__dirname, "../dockers/", challenge.dockerCompose, "/"), composeOptions: [["--verbose"], ["-p", challenge.dockerCompose + "_" + launcher.team]] });
//                     await challenges.updateOne({ _id: ObjectId(challenge._id) }, { $pull: { dockerLaunchers: { user: launcher.user, team: launcher.team } } });
//                 }
//             });
//         });
//     });
// });

async function getInfosfromUrl(url) {
    let infos = await fromUrl(url);
    if (!infos.treepath) throw new Error("Invalid project path");
    if (!infos.committish) throw new Error("Invalid project path");
    // Get the challenge path, from Github Url. ex: prog/nop
    let projectPath = url.split("/");
    infos.projectPath = projectPath
        .slice(projectPath.indexOf(infos.committish) + 1)
        .join("/");
    infos.url = projectPath
        .slice(0, projectPath.indexOf(infos.committish) - 1)
        .join("/");

    return infos;
}

async function checkDockerExists(githubUrl) {
    // Get git infos from Github Url
    let infos = await getInfosfromUrl(githubUrl);

    // Path where the project will be cloned
    const dockerPath = `${__dirname}/../dockers/${infos.user
        }/${infos.project.replace(" ", "_")}/${infos.projectPath}`;

    // Create directory for the project
    let res = await fs.mkdirSync(dockerPath, { recursive: true });

    // Setup github module from infos
    const git = simpleGit(dockerPath, { config: ["core.sparsecheckout=true"] });

    if (res) {
        await git.init();
        let url = `https://${infos.url.slice(8)}.git`;
        if (process.env.GITHUB_TOKEN) {
            url = `https://${process.env.GITHUB_TOKEN}@${infos.url.slice(8)}.git`;
        }
        await git.addRemote("origin", url);
    } else {
        await git.fetch();
    }

    // Pull project
    await git.pull("origin", infos.committish);

    return dockerPath;
}

exports.deployDocker = async function (req, res) {
    const ownerId = req.body.ownerId;
    const challengeId = req.body.challengeId;

    try {
        if (progress.has(challengeId + "_" + ownerId)) {
            if (progress.get(challengeId + "_" + ownerId) != "stopping")
                throw Error("Docker is launching!");
            else if (progress.get(challengeId + "_" + ownerId) == "stopping")
                throw Error("Docker is stopping!");
        }

        await progress.set(challengeId + "_" + ownerId, "deploying");

        if (
            (await dockers.findOne({ dockerId: challengeId + "_" + ownerId })) !=
            undefined
        ) {
            progress.delete(challengeId + "_" + ownerId);
            throw new Error("Owner already has a docker running!");
        }

        const dockerPath = await checkDockerExists(req.body.githubUrl);

        if (
            !fs.existsSync(`${dockerPath}/docker-compose.yaml`) &&
            !fs.existsSync(`${dockerPath}/docker-compose.yml`)
        ) {
            progress.delete(challengeId + "_" + ownerId);
            throw new Error("docker-compose.yml not found in project");
        }

        // launch docker
        await compose.upAll({
            cwd: dockerPath,
            composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
        });

        var containers = await compose.ps({
            cwd: dockerPath,
            composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
        });

        let i = 0;
        try {
            while (
                containers.data.services[i].ports.length == 0 ||
                !containers.data.services[i].ports[0].hasOwnProperty("mapped")
            ) i += 1;

            var port = containers.data.services[i].ports[0].mapped.port;
            await dockers.create({
                dockerId: challengeId + "_" + ownerId,
                challengeId: challengeId,
                ownerId: ownerId,
                mappedPort: port,
                deployTime: new Date().getTime(),
                githubUrl: req.body.githubUrl,
                path: dockerPath,
            });
        } catch (err) {
            await dockers.deleteOne({
                dockerId: challengeId + "_" + ownerId,
                challengeId: challengeId,
                ownerId: ownerId,
            });

            await compose.stop({
                cwd: dockerPath,
                composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
            });

            await compose.rm({
                cwd: dockerPath,
                composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
            });

            progress.delete(challengeId + "_" + ownerId);
            throw new Error("Error launching docker!");
        }

        progress.delete(challengeId + "_" + ownerId);
        res.send({ state: "success" });
    } catch (err) {
        if (err) {
            res.send({ state: "error", message: err.message });
        }
    }
};

exports.shutdownDocker = async function (req, res) {
    const ownerId = req.body.ownerId;
    const challengeId = req.body.challengeId;

    try {
        if (progress.has(challengeId + "_" + ownerId)) {
            if (progress.get(challengeId + "_" + ownerId) != "stopping")
                throw Error("Docker is launching!");
            if (progress.get(challengeId + "_" + ownerId) == "stopping")
                throw Error("Docker is stopping!");
        }

        progress.set(challengeId + "_" + ownerId, "stopping");

        const docker = await dockers.findOne({
            dockerId: challengeId + "_" + ownerId,
        });

        if (!docker) {
            progress.delete(challengeId + "_" + ownerId);
            throw new Error("This Docker does not exist!");
        }

        // stop docker
        await compose.stop({
            cwd: docker.path,
            composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
        });
        await compose.rm({
            cwd: docker.path,
            composeOptions: [["--verbose"], ["-p", challengeId + "_" + ownerId]],
        });

        await dockers.deleteOne({
            dockerId: challengeId + "_" + ownerId,
            challengeId: challengeId,
            ownerId: ownerId,
        });

        progress.delete(challengeId + "_" + ownerId);
        res.send({ state: "success" });
    } catch (err) {
        if (err) {
            res.send({ state: "error", message: err.message });
        }
    }
};

exports.getDockers = async function (req, res) {
    const ownerId = req.body.ownerId;

    const ownerDockers = (await dockers.find({ ownerId: ownerId })).map(
        (docker) => {
            let copy = { ...docker._doc, id: docker.id };

            if (progress.get(copy.dockerId)) {
                copy.progress = progress.get(docker.dockerId);
            }

            copy.url = `${process.env.DOCKER_URI}:${docker.mappedPort}`;

            return copy;
        }
    );

    res.send({ state: "success", dockers: ownerDockers });
};
