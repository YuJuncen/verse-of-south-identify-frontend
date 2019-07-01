const jwt = require('jsonwebtoken');
const async = require('../services/async');

function vaildJwt(req, res, next) {
    const { 'x-jwt-token': token } = req.headers;
    if (!token) {
        res.status(401)
            .json({ message: 'no jwt token.' })
        return;
    }
    try {
        req.jwt = jwt.verify(token, req.app.get('jwt secret'))
        next()
    } catch(e) {
        console.error(e);
        res.status(403)
            .json({ message: 'failed to verify jwt token.'})
    }
}

module.exports = { vaildJwt }