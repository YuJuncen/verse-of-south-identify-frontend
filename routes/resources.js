var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var { get } = require('axios')
var { vaildJwt } = require('../middlewares/jwt');
var async = require('../services/async');

router.get('/users', async (req, res, next) => {
    try {
        const { uid, password } = req.query;
        if (!uid || !password) {
            res.status(400)
                .json({ message: "Field " + ['uid', 'password'].filter(x => !eval(x)).join(', ') + " not found." })
            return;
        }
        try {
            const result = await get(`${req.app.get('api site')}/users/authorize`, {
                params: { uid, password }
            })
            const link = result.data._links.href.replace(/{.*}/, '');
            const token = await async(jwt.sign)({
                user: link,
                exp: req.app.get('jwt expire')(Date)
            }, req.app.get('jwt secret'));
            res.status(200)
                .json({ token })
        } catch (e) {
            console.error(e);
            res.status(403)
                .json({ message: e.response.data })
        }
    } catch (e) {
        next(e)
    }
})

router.get('/users/authorization', vaildJwt)
router.get('/users/authorization', async (req, res, next) => {
    try {
        const user = await get(req.jwt.user, {
            params: { projection: 'UserExcerpt' }
        });
        user.data._links = undefined;
        res.json({
            user: user.data,
        })
    } catch (e) {
        next(e)
    }
})

router.get('/users/:uid', async (req, res, next) => {
    try {
        const uid = req.params.uid;
        const user = await get(`${req.app.get('api site')}/users/search/findFirstByUid`, { params: { uid, projection: 'UserExcerpt' } })
        user.data._links = undefined;
        res.json(user.data)
    } catch (e) {
        if (res.response.status === 404) {
            res.status(404)
                .end();
            return;
        }
        next(e)
    }
})


module.exports = router