const getWatchList = (userId) => {

    fetch('/getWatchList', {
        method: 'POST', headers: {
            "uname": userId
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err))

}