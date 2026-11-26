const fs = require('node:fs');
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = ({config}) => {
    // Le fichier vient de Firebase pour le package Inspect, localement ou via une variable de type fichier EAS.
    const firebase = process.env.GOOGLE_SERVICES_JSON ||
        (fs.existsSync('./google-services.json') ? './google-services.json' : config.android?.googleServicesFile);
    if (firebase) {
        const data = JSON.parse(fs.readFileSync(firebase,'utf8'));
        if (!data.client?.some(client => client.client_info?.android_client_info?.package_name === config.android?.package)) {
            throw new Error('Le fichier Firebase ne correspond pas au package Android d’IGF Inspect.');
        }
        config = {...config,android:{...config.android,googleServicesFile:firebase}};
    }
    if (process.env.IGF_ALLOW_LOCAL_HTTP !== '1') return config;
    // Le client de développement peut joindre l'API du poste sur le réseau Wi-Fi.
    return withAndroidManifest(config,result => {
        const application = result.modResults.manifest.application?.[0];
        if (application) application.$['android:usesCleartextTraffic'] = 'true';
        return result;
    });
};
