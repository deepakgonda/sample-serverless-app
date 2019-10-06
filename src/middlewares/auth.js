const knex = require('../db/knex');
const createError = require('http-errors');
var jwt = require('jsonwebtoken');



const authMiddleware = {
    isAuthenticated: async (req, res, next) => {

        try {
            
            if (!req.headers || !req.headers.authorization) {
                next(createError(401));
            }

            let token = req.headers.authorization;
            token = token.replace('Bearer ', '');

            if (token && token != '') {

                // Very token using JWT
                 console.log('[][auth]: Token', token);
                const decodedTokenData = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                // console.log('[middleware][auth]: Token Decoded Data:', decodedTokenData);

                const userId = decodedTokenData.id;
                req.id = decodedTokenData.id;

                let currentUser = await knex('users').where({ id: decodedTokenData.id });
                currentUser = currentUser[0];

                console.log('[middleware][auth]: Current User:', currentUser);

                if (currentUser.isActive) {

                    let roles = await knex('user_roles').where({ userId: currentUser.id });
                    currentUser.roles = roles;

                    const Parallel = require('async-parallel');
                    currentUser.roles = await Parallel.map(currentUser.roles, async item => {
                        let rolename = await knex('roles').where({ id: item.roleId }).select('name');
                        rolename = rolename[0].name;
                        return rolename;
                    });

                    req.me = currentUser;
                    return next();
                }

                // If currentUser isNotActive
                return next(createError(401));

            } else {
                return next(createError(401));
            }
        } catch (err) {
            console.log('[middleware][auth] :  Error', err);
            next(createError(401));
        }
    },

    isAdmin: async (req, res, next) => {

        try {
           
            let currentUser = req.me;

            if(currentUser && currentUser.roles && currentUser.roles.includes("superAdmin") || currentUser.roles.includes("admin")){
                return next();
            }
            return next(createError(403));
        } catch (err) {
            console.log('[middleware][auth][isAdmin] :  Error', err);
            next(createError(401));
        }
    },
    isSuperAdmin: async (req, res, next) => {

        try {
           
            let currentUser = req.me;

            if(currentUser && currentUser.roles && currentUser.roles.includes("superAdmin") || currentUser.roles.includes("admin")){
                return next();
            }
            return next(createError(403));
        } catch (err) {
            console.log('[middleware][auth][isSuperAdmin] :  Error', err);
            next(createError(401));
        }
    }
};

module.exports = authMiddleware;


