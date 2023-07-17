// DOM Elements
const userNameEle = document.querySelector("#email");
const passwordEle = document.querySelector("#passwd");

const loginBtnEle = document.querySelector("#loginbtn");
const logoutBtnEle = document.querySelector("#logoutbtn");

const brandTextEle = document.querySelector("#brand-text");
const stockSearchFieldEle = document.querySelector("#stocksearchfield");
const logInModalClose = document.querySelector("#loginmodalclose");

const signInBtnEle = document.querySelector('#signInBtn')
const signUpBtnEle = document.querySelector('#signupBtn')


// DOM Elements

let HOST = ''

if (window.location.host == 'investobaba.web.app') {
    HOST = 'https://iotapi.vercel.app'
} else if(window.location.host == 'amused-hare-long-johns.cyclic.app'){
    HOST = 'https://amused-hare-long-johns.cyclic.app'
} else {
    HOST = 'http://localhost:3000'
}

export {
    HOST, userNameEle, passwordEle,
    loginBtnEle, logoutBtnEle, brandTextEle,
    stockSearchFieldEle, signInBtnEle, logInModalClose,
    signUpBtnEle
}
