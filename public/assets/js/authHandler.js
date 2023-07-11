import {
    HOST, signInBtnEle, userNameEle,
    passwordEle, logInModalClose,
    loginBtnEle, logoutBtnEle, stockSearchFieldEle,
    signUpBtnEle
} from './env.js'
import { auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from './fbConfig.js'


if (signInBtnEle) {
    signInBtnEle.addEventListener('click', () => {

        const email = userNameEle.value
        const pass = passwordEle.value

        signInWithEmailAndPassword(auth, email, pass)
            .then(user => {
                logInModalClose.click()
            })
            .catch(err => console.log(err))

    })
}

if (logoutBtnEle) {

    logoutBtnEle.addEventListener('click', () => signOut(auth));
}


if (signUpBtnEle) {

    signUpBtnEle.addEventListener('click', () => {

        const email = userNameEle.value
        const pass = passwordEle.value

        createUserWithEmailAndPassword(auth, email, pass)
            .then((user) => {
                console.log(user)
                logInModalClose.click()
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });

    })

}

