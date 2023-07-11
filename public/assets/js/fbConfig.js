import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVVVvQPkU69o16cw5Wc_2l-k5xF9JnmBc",
    // authDomain: "investobaba.firebaseapp.com",
    // databaseURL: "https://investobaba-default-rtdb.asia-southeast1.firebasedatabase.app",
    // projectId: "investobaba",
    // storageBucket: "investobaba.appspot.com",
    // messagingSenderId: "666025054627",
    // appId: "1:666025054627:web:fac7a41d624b915103ca16"
};


const firebase = initializeApp(firebaseConfig);
const auth = getAuth();

export default { firebase }
export { auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword }
