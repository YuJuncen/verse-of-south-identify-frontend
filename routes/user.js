var express = require('express');
var router = express.Router();
var { self, selfOrAdmin } = require('../middlewares/filters');
var sharp = require('sharp');
var Base64 = require('base64-js');
var { patch } = require('axios');

/* GET home page. */
router.get('/', async function(req, res) {
    if (req.session['user']){
        res.render('user', {user: 
            {
                ...req.session.user,
            }
        });
        return;
    }
    res.redirect('/');
});

router.all('/personal', self)
router.get('/personal', async function(req, res) {
    res.render('personal-edit', {user: req.session.user});
})

router.post('/personal', async function(req, res) {
    try {
        const diff = await makeDiff(req, res);
        const result = await require('axios').patch(req.session.user._links.self.href, {
                personal: diff
        });
        await req.app.get('publish event')('updated', req)
        res.render('personal-edit', {user: req.session.user, infomation: "Save 终了。[" + result.status + "]"})
    } catch(e) {
        console.error(e);
        res.render('personal-edit', {user: req.session.user, error: e })
    }
})

module.exports = router;

async function makeDiff(req, res) {
    const diff = {};
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        diff['avatar'] = (await sharp(avatar.data)
            .png()
            .resize(req.app.get('avatar size'))
            .toBuffer()).toString('base64');
    }
    if (req.body['nick-name'] != req.session.user.personal.nickName) {
        diff['nickName'] = req.body['nick-name'];
    }
    diff['emailAddress'] = req.body['emailAddress'];
    return diff;
}

router.all('/password/:uid', selfOrAdmin)
router.get('/password/:uid', async (req, res, next) => {
    try {
        const uid = req.params.uid;
        res.render('change-password', { uid });
    } catch(e) {
        next(e)
    }
})
router.post('/password/:uid', async (req, res, next) => {
    try {
        const uid = req.params.uid;
        const { oldPassword, newPassword, newPassword1 } = req.body;
        try {
            if (newPassword !== newPassword1) {
                res.render('change-password', { uid, error: '两次密码输入不一致。' })
                return;
            }
            await patch(`${req.app.get('api site')}/users/password`, {
                uid, oldPassword, newPassword
            });
            res.render('change-password', { uid, info: 'Save 终了。'})
        } catch(e) {
            res.render('change-password', { uid, error: JSON.stringify(e.response.data) })
        }
    } catch(e) {
        next(e)
    }
})