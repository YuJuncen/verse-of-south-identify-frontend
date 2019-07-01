var express = require('express');
var router = express.Router();
var { admin } = require('../middlewares/filters');
var { get, post, patch } = require('axios');

router.all('/**', admin)
router.get('/', async (req, res) => {
    const roles = await get(`${req.app.get('api site')}/roles`);
    res.render('role-edit', { roles: roles.data._embedded.roles, user: { uid: req.session.user.uid }})
})

router.post('/', async (req, res, next) => {
    try {
        const { roleName, description } = req.body;
        const result = await post(`${req.app.get('api site')}/roles`, { roleName, description });
        const roles = await get(`${req.app.get('api site')}/roles`);
        res.render('role-edit', { roles: roles.data._embedded.roles, user: { uid: req.session.user.uid } })
    } catch(e) {
        next(e)
    }

})

router.get('/mgr', async (req, res, next) => {
    try {
        const page = req.query.page || 0;
        const usersResult = await get(`${req.app.get('api site')}/users`, {
            params: { page, projection: 'NoPersonal' }
        });
        const { _embedded: {users}, page: pageInfo } = usersResult.data;
        console.log({ users, pageInfo });
        res.render('user-role-list', { users, pageInfo });
    } catch(e) {
        next(e)
    }
})

const handleUserMgrRequest = async (req, res, next) => {
    try {
        const user = await get(`${req.app.get('api site')}/users/search/findFirstByUid`, {
            params: { uid: req.params.uid }
        });
        if (user.status === 404) {
            res.redirect('../');
            return;
        }
        const userRoles = new Set((await get(user.data._links.roles.href)).data._embedded.roles.map(role => role.roleName));
        const { data: { _embedded: { roles: allRoles } } } = await get(`${req.app.get('api site')}/roles`);
        res.render('user-role-manage', { user: { uid: user.data.uid }, userRoles, allRoles });
    }
    catch (e) {
        next(e);
    }
};

router.get('/mgr/:uid', handleUserMgrRequest)
router.post('/mgr/:uid', async (req, res, next) => {
    try {
        const user = await get(`${req.app.get('api site')}/users/search/findFirstByUid`, {
            params: {uid: req.params.uid}
        });
        if (user.status === 404) {
            res.redirect('../')
            return;
        }
        if (!(req.body.roles instanceof Array)) {
            req.body.roles = [ req.body.roles ]
        }
        await patch(user.data._links.self.href, { roles: req.body.roles })
        if (req.params.uid === req.session.user.uid) {
            await req.app.get('publish event')('updated', req)
        }
        handleUserMgrRequest(req, res, next)
    } catch(e) {
        next(e)
    }
})

module.exports = router