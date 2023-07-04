const firebase = require("firebase/app");
const path = require("path");

const { getDatabase, ref, set, get, child } = require('firebase/database');
const { getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged } = require("firebase/auth");

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  databaseURL: process.env.FB_DB_URL,
};

const fbApp = firebase.initializeApp(firebaseConfig);
const database = getDatabase();
const auth = getAuth();
const dbRef = ref(getDatabase());


exports.FBsignIn = async (req, res) => {

  let userName = req.body.name || false
  let password = req.body.passwd || false

  try {
    const userCredential = await signInWithEmailAndPassword(auth, userName, password)
    res.status(200).json({ "msg": "success" })

  } catch (error) {

    res.status(200).json({ "msg": error })
  }
  // .then((userCredential) => {
  //     // Signed in
  //     const user = userCredential.user;
  //     res.status(200).json({ "msg": "success" })
  //     // ...
  // })
  // .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     res.status(200).json({ "msg": "failed" })
  // });

}

exports.authStateCheck = async (req, res) => {

  //  await onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //          const uid = user.uid;
  //           res.status(200).json({ "msg": user })
  //       } else {
  //        res.status(200).json({ "error": "error" })
  //       }
  //    });

  const user = await auth.currentUser;

  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    // ...

    res.status(200).json({ "msg": user })
  } else {
    // No user is signed in.
    res.status(200).json({ "error": "error" })
  }
}

exports.loginStateCheck = (req, res) => {

  const user = auth.currentUser;

  console.log(user)

  if (user) {

    res.sendFile(path.join(__dirname, '/public/dashboard.html'));

  } else {
    
    res.sendFile(path.join(__dirname, '/public/index.html'));

  }

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     const uid = user.uid;
  //     res.sendFile(path.join(__dirname, '/public/dashboard.html'));
  //   } else {
  //     res.sendFile(path.join(__dirname, '/public/index.html'));
  //   }
  // });


}



// createUserWithEmailAndPassword(auth, "prasanta.1987@hotmail.com", "password")
//   .then((userCredential) => {
//     // Signed in
//     const user = userCredential.user;
//     console.log(user)
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // ..
//   });


// signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//         // Signed in
//         const user = userCredential.user;
//         console.log(user.uid)
//         // ...
//     })
//     .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//     });


// get(child(dbRef, `users`)).then((snapshot) => {
//     console.log(snapshot.val());
// }).catch((error) => {
//     console.error("===>", error);
// });

const email = "prasanta.1987@hotmail.com";
const password = "password";


// (async () => {
//     const signStat = await signInWithEmailAndPassword(auth, email, password)

//     console.log(await signStat.user.getIdToken())

// })();
