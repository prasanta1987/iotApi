const singOut = () => {

    fetch('/signOut', {
        method: 'POST',
        headers: { "cache-control": "no-cache" }
    })
        .then(res => res.json())
        .then(data => {
            if (data.msg == "Successful") window.location = '/'
        })
        .catch(err => console.log(err))
}

const login = () => {
    const userName = document.querySelector("#email").value;
    const password = document.querySelector("#passwd").value;

    const fetchConfig = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userName,
            passwd: password
        })
    }
    fetch('/login', fetchConfig)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.msg = "Login Successful") {
                window.location = '/index.html'
            }
        })
        .catch(err => console.log(err))


}

const signUp = () => {
    const userName = document.querySelector("#email").value;
    const password = document.querySelector("#passwd").value;

    const fetchConfig = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userName,
            passwd: password
        })
    }
    fetch('/signup', fetchConfig)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))


}
