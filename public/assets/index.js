const userName = document.querySelector("#email");
const password = document.querySelector("#passwd");
const loginBtn = document.querySelector("#loginbtn");
const logoutBtn = document.querySelector("#logoutbtn");
const brandText = document.querySelector("#brand-text");

(() => {
    fetch('/loginStatus', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.logInStat) {
                loginBtn.classList.add('d-none')
                brandText.innerHTML = data.userName
                brandText.style = "text-transform : capitalize";
            } else {
                logoutBtn.classList.add('d-none')
            }
        })
        .catch(err => console.log(err))

})();

const singOut = () => {

    fetch('/signOut', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.msg == "success") window.location = `/`
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
    fetch('/signIn', fetchConfig)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.msg == "success") window.location = `/`
        })
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
    fetch('/signup', fetchConfig)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))

}

const returnTimeStamp = () => {
    return new Date().getTime()
}