import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth, signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVVVvQPkU69o16cw5Wc_2l-k5xF9JnmBc",
    authDomain: "investobaba.firebaseapp.com",
    databaseURL: "https://investobaba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "investobaba",
    storageBucket: "investobaba.appspot.com",
    messagingSenderId: "666025054627",
    appId: "1:666025054627:web:fac7a41d624b915103ca16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        console.log(uid)
    } else {
        console.log("Not Signed In")
    }
});

// signOut(auth).then(() => {
//     // Sign-out successful.
//   }).catch((error) => {
//     // An error happened.
//   });

// document.querySelector('#signInBtn').addEventListener('click', () => {

//     const userNameEle = document.querySelector("#email");
//     const passwordEle = document.querySelector("#passwd");

//     const email = userNameEle.value;
//     const pass = passwordEle.value;

//     signInWithEmailAndPassword(auth, email, pass)
//         .then((userCredential) => {
//             // Signed in
//             const user = userCredential.user;

//             console.log(user)
//             // ...
//         })
//         .catch((error) => {
//             const errorCode = error.code;
//             const errorMessage = error.message;
//         });

// })