const url = require("url");

/**
 * Create new HTTP(S) request to <url> with <options>
 * @param {string} uri 
 * @param {object} options 
 * @param {function} [cb]
 * @returns http/https request object: https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest
 */
module.exports = function request(uri, options, cb) {

    if (!cb && options instanceof Function) {
        cb = options;
        options = {};
    }

    options = Object.assign({
        method: "GET",
        body: ""
    }, options);


    let { protocol } = new url.URL(uri);

    if (!["http:", "https:"].includes(protocol)) {
        throw new Error(`Unspported protocol "${protocol.slice(0, -1)}`);
    }


    let request = require(protocol.slice(0, -1)).request(uri, options, (res) => {

        let chunks = [];

        res.on("data", (chunk) => {
            chunks.push(chunk);
        });

        res.on("error", cb);

        res.on("end", () => {

            let body = Buffer.concat(chunks);

            if (res.headers["content-type"] && res.headers["content-type"].includes("application/json")) {
                body = JSON.parse(body);
            }

            cb(null, {
                headers: res.headers,
                status: res.statusCode,
                body
            });

        });

    });


    request.on("error", (err) => {
        cb(err);
    });

    //request.write(options.body + "\r\n");

    return request;

};