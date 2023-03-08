const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
    const filePath = req.url === '/' ? './index.html' : '.' + req.url

    fs.readFile(filePath, (error, content) => {
        if (error) {
            return
        }
        res.writeHead(200)
        res.end(content)
    })
})

server.listen(3000, () => console.log('Server is listening on port 3000'))
