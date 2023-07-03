const userName = document.querySelector("#email");
const password = document.querySelector("#passwd");
const loginBtn = document.querySelector("#loginbtn");
const logoutBtn = document.querySelector("#logoutbtn");
const brandText = document.querySelector("#brand-text");
const stockSearchField = document.querySelector("#stocksearchfield");

const HOST = 'https://iotapi.vercel.app';

(() => {
    fetch(`${HOST}/loginStatus`, { method: 'POST' })
        .then(res => res.json())
        // .then(data => {
            // console.log(data)
            // if (data.logInStat) {
            //     displaylogInElement("login")
            //     let userId = data.userName
            //     brandText.innerHTML = userId
            //     try {
            //         getWatchList(userId)
            //     } catch (error) {

            //     }
            // } else {
            //     brandText.innerHTML = "Hello"
            //     displaylogInElement("logout")
            // }
        // })
        .catch(err => console.log(err))

})();

const singOut = () => {

    fetch(`${HOST}/signOut`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            // console.log(data)
            // if (data.msg == "success") window.location = `/`
        })
        .catch(err => console.log(err))
}

const login = () => {

    const fetchConfig = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userName.value,
            passwd: password.value
        })
    }
    fetch(`${HOST}/signIn`, fetchConfig)
        .then(res => res.json())
        // .then(data => {
        //     console.log(data)
        //     document.querySelector('#loginmodalclose').click()
        //     brandText.innerHTML = userName.value
        //     brandText.style = "text-transform : capitalize";

        //     if (data.msg == "success") {
        //         // if (data.msg == "success") window.location = `/dashboard`
        //         displaylogInElement("login")
        //     } else {
        //         displaylogInElement("logout")
        //     }
        // })
        .catch(err => console.log(err))
}

const signUp = () => {

    const fetchConfig = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userName.value,
            passwd: password.value
        })
    }
    fetch(`${HOST}/signup`, fetchConfig)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))

}


const displaylogInElement = (stat) => {

    if (stat == "login") {
        loginBtn.classList.remove('d-block')
        loginBtn.classList.add('d-none')

        logoutBtn.classList.add('d-block')
        logoutBtn.classList.remove('d-none')

        stockSearchField.classList.remove('d-none')
        stockSearchField.classList.add('d-block')

    } else if (stat == "logout") {

        loginBtn.classList.add('d-block')
        loginBtn.classList.remove('d-none')

        logoutBtn.classList.remove('d-block')
        logoutBtn.classList.add('d-none')

        stockSearchField.classList.add('d-none')
        stockSearchField.classList.remove('d-block')

    }



}