const ctfConfig = require('./models/ctfConfigModel.js');
const theme = require('./models/themeModel.js');
const users = require('./models/userModel.js');
const encryptionController = require('./controllers/encryptionController.js');

exports.setupDB = async function() {
    const endTimeConfig = await ctfConfig.findOne({ name: 'endTime' });

    if (!endTimeConfig) {
        await ctfConfig.create({
            name: 'endTime',
            value: 0
        });
    }

    const startTimeConfig = await ctfConfig.findOne({ name: 'startTime' });

    if (!startTimeConfig) {
        await ctfConfig.create({
            name: 'startTime',
            value: 0
        });
    }

    const rulesConfig = await ctfConfig.findOne({ name: 'rules' });

    if (!rulesConfig) {
        await ctfConfig.create({
            name: 'rules',
            value: [{
                text: "- Don't share flags, or share info with other teams!"
            }, {
                text: "- Dont DDOS our services or bruteforce any flags/websites"
            }, {
                text: "- If you do not understand the rules:",
                link: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
                linkText: "https://www.sec.gov/"
            }]
        });
    }

    const globalMessageConfig = await ctfConfig.findOne({ name: 'globalMessage' });

    if (!globalMessageConfig) {
        await ctfConfig.create({
            name: 'globalMessage',
            value: {
                message: '',
                seenBy: []
            }
        });
    }

    const currentTheme = await theme.findOne({});
    if (!currentTheme) {
        await theme.create({
            color_1: "#ff3d3d",
            color_2: "#ff7070",
            bg_img: "none"
        });
    }

    const adminExists = await users.findOne({ isAdmin: true });

    if (!adminExists) {
        const password = await encryptionController.encrypt('admin');

        await users.create({ username: 'admin', password: password, key: 'none', isAdmin: true });
        console.log('Created default admin. admin:admin');
    }

    console.log("Database Setup successfully");
}