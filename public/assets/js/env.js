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

// const HOST = 'http://localhost:3000'
const HOST = 'https://iotapi.vercel.app'

export {
    HOST, userNameEle, passwordEle,
    loginBtnEle, logoutBtnEle, brandTextEle,
    stockSearchFieldEle, signInBtnEle, logInModalClose,
    signUpBtnEle
}