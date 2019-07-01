var express = require('express');
var router = express.Router();
var makeService = require('../services/user')
const { post } = require('axios');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const service = makeService(req.app.get("api site"));
  const {username, password} = req.query;
  if (username && password) {
    try {
      const user = await service.getUserInfo(username, password);
      req.session.user = user;
      res.redirect('/user');
    } catch (e) {
      res.render('index', {title: 'vidt', error: e.response.data, user: req.session.user});
    }
    return;
  }
  res.render('index', { title: 'vidt',  user: req.session.user });
});

router.get('/register', function(req, res, next) {
  res.render('register', {  })
})
router.post('/register', async function(req, res, next) {
  const service = makeService(req.app.get("api site"));
  const {username, password, password1} = req.body;
  if (password1 !== password) {
    res.render('register', {error: '两次密码不一致'})
    return
  }
  try {
    if (username && password && password1) {
      try {
        const result = await post(`${req.app.get('api site')}/users/register`, { uid: username, password })
        const user = await service.getUserInfo(username, password);
        req.session.user = user;
        res.redirect('/user');
      } catch(e) {
        res.render('register', {error: e.response.data})
      }
      return;
    }
    res.render('register', {error: 'No username or password get.'})
  } catch(e) {
    next(e)
  }
})

module.exports = router;
