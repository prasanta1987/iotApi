(() => {

    fetch('/getWatchList', {
        method: 'POST', headers: {
            "uname": "user"
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err))

})();