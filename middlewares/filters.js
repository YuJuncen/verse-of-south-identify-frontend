function self(req, res, next) {
    try {
        const user = req.session.user;
        if ([req.query.uid, req.params.uid, req.body.uid].some(x => x === user.uid)) {
            next();
            return;
        }
    } catch(_) { }
    res.status(403)
        .render('forbidden', {message: 'You can\'t access this.', error: {status: 403, stack: ""}})
}

function admin(req, res, next) {
    try {
        const user = req.session.user;
        if (user.roles.find(({roleName}) => roleName === 'wheel')) {
            next();
            return;
        }
    } catch(_) { }
    res.status(403)
        .render('forbidden', {message: 'You can\'t access this.', error: {status: 403, stack: ""}})
}

function selfOrAdmin(req, res, next) {
    try {
        const user = req.session.user;
        console.log([req.query.uid, req.params.uid, req.body.uid]);
        if (user.roles.find(role => role === 'wheel') || 
            [req.query.uid, req.params.uid, req.body.uid].some(x => x === user.uid)) {
            next();
            return;
        }
    } catch(_) { }
    res.status(403)
        .render('forbidden', {message: 'You can\'t access this.', error: {status: 403, stack: ""}})
}

module.exports = { self, admin, selfOrAdmin }