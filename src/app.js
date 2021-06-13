const path = require('path')
const express = require('express');
const app = express()

const port = process.env.PORT || 3000
const minFaves = 100
const minRetweets = 100

app.use(express.urlencoded( {extended: true} ))  // for parsing application/xwww-form-urlencoded
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (_, res) => {
    _sendToHomePage(res)
})

app.post('/popular', (req, res) => {
    const url = _topTweetsUrl(req.body.username)
    res.redirect(url)
})

app.post('/today', (req, res) => {
    const url = _todayTweetsUrl(req.body.username)
    res.redirect(url)
})

app.get('/:username', (req, res) => {
    if (!req.params.username) {
        console.log('No `username` provided within the query params. Redirecting to the homepage...')
        _sendToHomePage(res)
        return
    }

    if (req.subdomains.length == 0) {
        console.log('No subdomain provided. Redirecting to the homepage...')
        _sendToHomePage(res)
        return
    }
    if (req.subdomains.length > 1) {
        console.log('More that one subdomain provided. Redirecting to the hompage...')
        _sendToHomePage(res)
        return
    }

    const subdomain = req.subdomains[0]
    switch(subdomain) {
        case 'popular':
            res.redirect(_topTweetsUrl(req.params.username))
            break
        case 'today':
            res.redirect(_todayTweetsUrl(req.params.username))
            break
        default:
            console.log('No username provided.')

    }
})

const _sendToHomePage = (res) => res.sendFile(path.join(__dirname, '../public/tweetsby.html'))

const _topTweetsUrl = (username) => {
    const split = username.split('@')
    username = split.length > 1 ? split[1]: split[0]

    let query = `from:${username} min_faves:${minFaves} OR min_retweets:${minRetweets}`
    query = encodeURI(query)
    return `https://twitter.com/search?q=${query}&f=live`
}

const _todayTweetsUrl = (username) => {
    const split = username.split('@')
    username = split.length > 1 ? split[1]: split[0]

    function formatDate(date) {
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = date.getFullYear();
        return `${yyyy}-${mm}-${dd}`
    }

    let today = new Date();
    let tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

    let query = `from:${username} since:${formatDate(today)} until:${formatDate(tomorrow)}`
    query = encodeURI(query)
    return `https://twitter.com/search?q=${query}&f=live`
}

app.listen(port, () => {
    console.log(`App listening at port ${port}`)
})


