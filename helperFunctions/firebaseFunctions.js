import admin from '../firebaseConfig/adminConfig.js';

export const getDbData = async (reference) => {

    const db = admin.database();
    const dbRef = db.ref(reference);
    const snapshot = await dbRef.once('value');
    const data = snapshot.val();

    return data
}

export const authCheck = async (req, res, next) => {
    const apiKey = req.query.apiKey;

    // 1. Check if key is provided
    if (!apiKey) {
        return res.status(401).json({ error: "API Key Required" });
    }

    try {

        const userUID = await getDbData(`userCred/APItoUID/${apiKey}/fbUID`);

        // 2. Validate key against database
        if (!userUID) {
            return res.status(401).json({ error: "Invalid API Key" });
        }

        // 3. Success: Store UID for the next route and proceed
        res.locals.userUID = userUID;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const setDBData = async (reference) => {

    const db = admin.database();
    const dbRef = db.ref(reference);
    await dbRef.update(data);

    return data
}

