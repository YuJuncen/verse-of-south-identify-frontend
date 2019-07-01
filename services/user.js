const { get } = require('axios');

const makeService = api => ({
    async getUserInfo(uid, password) {
        const result = await get(`${api}/users/authorize`, {
            params: {uid, password}
        });
        if (result.status === 200) {
            const link = result.data._links.href.replace(/{.*}/, '');
            const user = await get(link + '?projection=UserExcerpt');
            if (user.status === 200) {
                user.data.personal.avatar = 'data:image/png;base64, ' + user.data.personal.avatar
                return user.data;
            } 
            throw {
                status: user.status,
                message: result.data
            }
        }
        throw {
            status: result.status,
            message: result.data
        };
    }
})

module.exports = makeService