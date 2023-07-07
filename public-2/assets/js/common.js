import { auth } from './fbConfig.js'
import {
    HOST, signInBtnEle, userNameEle,
    passwordEle, logInModalClose,
    loginBtnEle, logoutBtnEle, stockSearchFieldEle
} from './env.js'

let authState = false

auth.onAuthStateChanged((user) => {
    if (user) {
        const idToken = user.accessToken
        console.log(user)
        displaylogInElement('login')
        authState = true
        // sOutBtn.style.display = 'block'
        // sInBtn.style.display = 'none'
        // document.querySelector('.brandname').innerHTML = user.displayName
        // document.querySelector('.ulogo').setAttribute("src", user.photoURL)
        // sessionStorage.uid = user.displayName
        // if (reportPage) reportPage.style.display = 'block'
        // if (addItemPage) addItemPage.style.display = 'block'
        // if (reportPage) reportPage.style.display = 'block'
        // if (addItemPage) addItemPage.style.display = 'block'
    } else {
        authState = true
        displaylogInElement('logout')
        if (location.pathname.replace("/", "") == "portfolio") { window.location = '/' }
        // window.location = '/'
        // sOutBtn.style.display = 'none'
        // sInBtn.style.display = 'block'
        // document.querySelector('.brandname').innerHTML = "Welcome Guest"
        // document.querySelector('.ulogo').setAttribute("src", "./assets/user.png")
        // console.log('Not Signed In')
        // sessionStorage.uid = null
        // if (reportPage) reportPage.style.display = 'none'
        // if (addItemPage) addItemPage.style.display = 'none'
    }
});

const displaylogInElement = (stat) => {

    if (stat == "login") {
        loginBtnEle.classList.remove('d-block')
        loginBtnEle.classList.add('d-none')

        logoutBtnEle.classList.add('d-block')
        logoutBtnEle.classList.remove('d-none')

        stockSearchFieldEle.classList.remove('d-none')
        stockSearchFieldEle.classList.add('d-block')

    } else if (stat == "logout") {

        loginBtnEle.classList.add('d-block')
        loginBtnEle.classList.remove('d-none')

        logoutBtnEle.classList.remove('d-block')
        logoutBtnEle.classList.add('d-none')

        stockSearchFieldEle.classList.add('d-none')
        stockSearchFieldEle.classList.remove('d-block')

    }



}


export { authState }