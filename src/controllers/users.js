const knex = require('../db/knex');

const usersController = {
    list: async (req, res) => {
        const users = await knex.select().from('users');

        let reqData = req.query;

        let pagination = {};
        let per_page = reqData.per_page || 10;
        let page = reqData.current_page || 1;
        if (page < 1) page = 1;
        let offset = (page - 1) * per_page;


        let [total, rows] = await Promise.all([
            knex.count('* as count').from("users").first(),
            knex.select("*").from("users").offset(offset).limit(per_page)
        ])

        let count = total.count;
        pagination.total = count;
        pagination.per_page = per_page;
        pagination.offset = offset;
        pagination.to = offset + rows.length;
        pagination.last_page = Math.ceil(count / per_page);
        pagination.current_page = page;
        pagination.from = offset;
        pagination.data = rows;

        res.status(200).json({
            data: {
                users: pagination,
                // currentUser: req.me
            }
        });
    },
};

module.exports = usersController;