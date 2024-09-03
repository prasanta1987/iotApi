const jwt = require('jsonwebtoken');
const axios = require('axios').default

const { multipleApiCalls, getAllPic, getStratagryData } = require('./helperFunctions')
const { randomIntFromInterval, getTime } = require('./commonFunctions')

const {batchSpotData} = require('./routes');

const firebase = require("firebase/app");
const { getDatabase, ref, set, get, child, update } = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } = require("firebase/auth");

const firebaseConfig = {
  apiKey: 'AIzaSyAVVVvQPkU69o16cw5Wc_2l-k5xF9JnmBc',
  databaseURL: 'https://investobaba-default-rtdb.asia-southeast1.firebasedatabase.app',
};

const fbApp = firebase.initializeApp(firebaseConfig);
const database = getDatabase();
const auth = getAuth();
const dbRef = ref(getDatabase());


// set(child(dbRef, 'devices'), "TEST")

// get(child(dbRef, `devices`)).then((snapshot) => {
//   console.log(snapshot.val());
// }).catch((error) => {
//   console.error("===>", error);
// });

exports.arduinoAskCred = async (req, res) => {

  let devOtp = req.body.deviceSlNo || false;

  const dataSnapShot = await get(child(dbRef, `devices/${devOtp}`))
  const dataSnap = await dataSnapShot.val()

  console.log(dataSnap)

  if (dataSnap == null) {

    await update(child(dbRef, `devices/${devOtp}`), {
      imageKitApi: false,
      uid: false
    })

    res.status(200).json({ "msg": "Credential Requested" })

  } else {

    if (dataSnap.imageKitApi == false && dataSnap.uid == false) {

      res.status(200).json({ "msg": "Waiting for Credential" })

    } else {

      res.status(200).json(dataSnap)

      await update(child(dbRef, `devices/${devOtp}`), {
        imageKitApi: null,
        uid: null
      })
    }

  }
}

exports.authArduino = async (req, res) => {

  let imageKitApi = req.body.imageKitApi || false;
  let uid = req.body.uid || false;


  try {

    await update(child(dbRef, `devices/${devOtp}`), {
      imageKitApi: imageKitApi,
      uid: uid
    })

    res.status(200).json({ "msg": "Success" })
  } catch (error) {
    res.status(500).json({ "msg": "Error" })
  }

}

exports.arduinoDevData = async (req, res) => {

  const userUID = req.params.userUID || null;

  const dataSnapShot = await get(child(dbRef, `/${userUID}`))
  const dataSnap = await dataSnapShot.val();

  const dispMode = dataSnap.dispMode
  const photoTags = dataSnap.photoTags
  const mktSnapShotList = dataSnap.mktSnapShotList.split(",")
  const watchList = dataSnap.WATCHLIST.split(",")


  if (dispMode == "STRATEGY") {

    const optStrDataObj = await getStratagryData(dataSnap)
    res.status(200).json(optStrDataObj)

  } else if (dispMode == "MKTSNAPSHOT") {

    const timeData = await getTime();
    const timeSlug = timeData.time + " " + timeData.amPM
    res.status(200).json({
      dispMode: dispMode,
      data: await batchStockData(mktSnapShotList),
      time: timeSlug
    })
  } else if (dispMode == "WATCHLIST") {

    const timeData = await getTime();
    const timeSlug = timeData.time + " " + timeData.amPM
    res.status(200).json({
      dispMode: dispMode,
      data: await batchSpotData(watchList),
      time: timeSlug
    })

  } else {
    res.status(200).json({
      dispMode: dispMode,
      photoTags: photoTags || "",
      time: await getTime()
    })
  }


}




exports.listPics = async (req, res) => {

  const tag = (req.params.tag || "").toUpperCase()
  const photoUrls = await getAllPic(tag);

  res.status(200).json(photoUrls)

}

exports.getPicUrl = async (req, res) => {

  const tags = (req.params.tags || "").toUpperCase()
  const photoUrls = await getAllPic(tags);
  console.log(photoUrls)

  const randomNumber = randomIntFromInterval(0, photoUrls.length - 1)
  let time = ((await getTime()).time).replace(":", "%3a")
  let amPM = (await getTime()).amPM


  // let currentImageUrl = photoUrls[randomNumber].url

  let currentImageUrl = `${photoUrls[randomNumber].url}&tr=w-320,h-240,l-text,ly-195,pa-5,w-320,bg-00000060,i-${time},fs-50,co-FFFFFF,ia-left,l-end:l-text,lx-130,ly-200,i-${amPM},fs-20,co-FFFFFF,l-end`

  //  let currentImageUrl = `${photoUrls[randomNumber].url}/tr:w-320,h-240,l-text,ly-205,pa-5,w-320,bg-00000060,i-${time},fs-36,co-FFFFFF,ia-left,l-end:l-text,lx-100,ly-212,i-${amPM},fs-16,co-FFFFFF,l-end`
  // let currentImageUrl = `${photoUrls[randomNumber].url}/tr:w-320,h-240,l-text,ly-207,pa-5,w-320,bg-00000060,i-${time},fs-32,co-FFFFFF,ia-left,l-end:l-text,lx-90,ly-212,i-${amPM},fs-16,co-FFFFFF,l-end`

  res.redirect(currentImageUrl);

}


exports.updatePic = async (req, res) => {

  const fileId = req.params.fileId || ""
  const tags = req.params.tags || ""

  let allTags = []

  tags.split(",").forEach(tag => allTags.push(tag))

  try {

    const response = await axios.patch(`https://api.imagekit.io/v1/files/${fileId}/details`,
      { 'tags': allTags },
      {
        headers: { 'Content-Type': 'application/json' },
        auth: { username: 'private_OGPzuz1sTQnQ70a7wBypYzteJVo=' }
      }
    )
    res.status(200).json(response.data.tags)

  } catch (error) {
    res.status(500).json({ "error": "Something Went Wrong" })
  }

}
