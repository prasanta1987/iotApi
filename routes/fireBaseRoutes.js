import { getDbData } from '../helperFunctions/firebaseFunctions.js'
import admin from '../firebaseConfig/adminConfig.js';

export const getFeedData = async (req, res) => {

    const uid = res.locals.userUID;
    // const { deviceCode, feedName} = req.query;
    const deviceCode = req.query.deviceCode;
    const feedName = req.query.feedName || '';

    let dbRef;

    if (!deviceCode) res.status(401).json({ error: "Device Code Required" });

    const keysToRemove = ['isSelected', "time", "mcu"];

    if (feedName == "ALL" || feedName == '') {
        dbRef = `${uid}/${deviceCode}/devFeeds`;
    } else {
        dbRef = `${uid}/${deviceCode}/devFeeds/${feedName || ''}`;
    }

    let data = await getDbData(dbRef);

    if (feedName == "ALL" || feedName == '') {
        data = Object.keys(data).reduce((acc, deviceName) => {
            const device = { ...data[deviceName] }; // Copy the device object

            // Remove the unwanted keys
            keysToRemove.forEach(key => delete device[key]);

            acc[deviceName] = device;
            return acc;
        }, {});
    } else {

        keysToRemove.forEach(key => delete data[key]);
    }

    res.json(data);

}


export const setFeedData = async (req, res) => {

    const uid = res.locals.userUID;
    const { deviceCode, feedName } = req.query;

    if (!deviceCode || !feedName) {
        let errors = {};

        if (!deviceCode) errors.deviceCode = "Device Code is required";
        if (!feedName) errors.feedName = "Device Code is required";

        res.status(401).json({ "error": errors });
    }

    const dbRef = `${userUID}/${deviceCode}/devFeeds/${feedName}`;




}

export const SSE = async (req, res) => {
    const uid = res.locals.userUID;
    const { deviceCode, feedName } = req.query;

    if (!deviceCode) return res.status(400).json({ error: "Device Code Required" });

    // 1. Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const keysToRemove = ['isSelected', 'time', 'mcu'];
    const dbPath = (feedName === "ALL" || !feedName)
        ? `${uid}/${deviceCode}/devFeeds`
        : `${uid}/${deviceCode}/devFeeds/${feedName}`;

    const dbRef = admin.database().ref(dbPath);

    // 2. Setup Heartbeat (every 20 seconds)
    // Sending a line starting with ":" is treated as a comment in SSE and ignored by browsers
    const heartbeat = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 20000);

    // 3. Define Firebase Realtime Listener
    const onValueChange = (snapshot) => {
        let data = snapshot.val();
        if (!data) return;

        // Data Cleaning Logic
        if (feedName === "ALL" || !feedName) {
            data = Object.keys(data).reduce((acc, key) => {
                const device = { ...data[key] };
                keysToRemove.forEach(k => delete device[k]);
                acc[key] = device;
                return acc;
            }, {});
        } else {
            keysToRemove.forEach(k => delete data[k]);
        }

        // Send actual data
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    dbRef.on('value', onValueChange);

    // 4. Critical Cleanup
    req.on('close', () => {
        clearInterval(heartbeat); // Stop the heartbeat
        dbRef.off('value', onValueChange); // Remove Firebase listener
        res.end();
        console.log(`Connection closed`);
    });
}