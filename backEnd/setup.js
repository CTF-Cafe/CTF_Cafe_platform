const ctfConfig = require('./models/ctfConfigModel.js');
const theme = require('./models/themeModel.js');
const users = require('./models/userModel.js');
const encryptionController = require('./controllers/encryptionController.js');

exports.setupDB = async function() {
    const endTimeConfig = await ctfConfig.findOne({ name: 'endTime' });

    if (!endTimeConfig) {
        await ctfConfig.create({
            name: 'endTime',
            value: new Date().getTime()
        });
    }

    const startTimeConfig = await ctfConfig.findOne({ name: 'startTime' });

    if (!startTimeConfig) {
        await ctfConfig.create({
            name: 'startTime',
            value: new Date().getTime()
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

    const sponsorsConfig = await ctfConfig.findOne({ name: 'sponsors' });

    if (!sponsorsConfig) {
        await ctfConfig.create({
            name: 'sponsors',
            value: [{ image: 'https://www.offensive-security.com/wp-content/themes/OffSec/assets/images/offsec-logo.svg' }],
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

        await users.create({ username: 'admin', password: password, email: "admin@admin.com", verified: true, key: 'none', isAdmin: true });
        console.log('Created default admin. admin:admin');
    }

    const categoriesConfig = await ctfConfig.findOne({ name: 'categories' });

    if(!categoriesConfig) {
        await ctfConfig.create({
            name: 'categories',
            value: ["web", "crypto", "reverse", "pwn", "forensics"],
        });
    }

    const dynamicScoringConfig = await ctfConfig.findOne({ name: 'dynamicScoring' });

    if(!dynamicScoringConfig) {
        await ctfConfig.create({
            name: 'dynamicScoring',
            value: false,
        });
    }

    console.log("Database Setup successfully");
}