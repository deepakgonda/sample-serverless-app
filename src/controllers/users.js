const knex = require('../db/knex');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const moment = require('moment');
const trx = knex.transaction();
const uuidv4 = require('uuid/v4');
var jwt = require('jsonwebtoken');
const _ = require('lodash');

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
    getUserDetails: async (req, res) => {
        try {
            const id = req.query.id;
            let user = null
            userResult = await knex.from('users').where({ 'users.id': id })

            user = userResult[0]

            let roles = await knex('user_roles').where({ userId: id });

            const Parallel = require('async-parallel');
            roles = await Parallel.map(roles, async item => {
                let rolename = await knex('roles').where({ id: item.roleId }).select('name');
                rolename = rolename[0].name;
                return rolename;
            });

            let omitedUser = _.omit(user, ['createdAt', 'updatedAt', 'password', "verifyToken",
                "createdBy",
                "verifyTokenExpiryTime"])



            return res.status(200).json({
                data: {
                    user: { ...omitedUser, roles }
                },
                message: 'User Details'
            })
        } catch (err) {
            console.log('[controllers][serviceOrder][GetServiceOrderList] :  Error', err);
            res.status(500).json({
                errors: [
                    { code: 'UNKNOWN_SERVER_ERROR', message: err.message }
                ],
            });
        }
    },
    updateUserDetails: async (req, res) => {
        try {
            let user = null;
            await knex.transaction(async trx => {

                let payload = _.omit(req.body, ['password', 'id']);



                // validate keys
                const schema = Joi.object().keys({
                    name: Joi.string().allow('').optional(),
                    userName: Joi.string().allow('').optional(),
                    mobileNo: Joi.number().allow('').optional(),
                    email: Joi.string().email({ minDomainSegments: 2 }).allow('').optional(),
                    gender: Joi.string().allow('').optional(),
                    location: Joi.string().allow('').optional(),
                    houseId: Joi.string().allow('').optional()
                });

                const result = Joi.validate(payload, schema);

                if (result && result.hasOwnProperty('error') && result.error) {
                    return res.status(400).json({
                        errors: [
                            { code: 'VALIDATION_ERROR', message: result.error.message }
                        ],
                    });
                }

                console.log('[controllers][entrance][signup]: JOi Result', result);


                if (!_.isEmpty(req.body.password)) {
                    const PasswordComplexity = require('joi-password-complexity');
                    const complexityOptions = {
                        min: 6,
                        max: 100,
                        lowerCase: 1,
                        upperCase: 0,
                        numeric: 1,
                        symbol: 1,
                        requirementCount: 2,
                    }
                    let sc = Joi.object().keys({
                        password: new PasswordComplexity(complexityOptions),
                    })
                    let passResult = Joi.validate({ password: req.body.password }, sc)
                    if (passResult && passResult.hasOwnProperty('error') && passResult.error) {
                        return res.status(400).json({
                            errors: [
                                { code: 'VALIDATION_ERROR', message: passResult.error.message }
                            ],
                        });
                    }
                    const hash = await bcrypt.hash(req.body.password, saltRounds);
                    payload.password = hash;

                }



                // Check unique username & email id 
                const existUser = await knex('users').where({ userName: payload.userName });
                const existEmail = await knex('users').where({ email: payload.email });
                const existMobile = await knex('users').where({ mobileNo: payload.mobileNo });
                const existHouseId = await knex('users').where({ houseId: payload.houseId });

                console.log('[controllers][entrance][signup]: UserExist', existUser);
                console.log('[controllers][entrance][signup]: EmailExist', existEmail);
                console.log('[controllers][entrance][signup]: MobileNoExist', existMobile);
                console.log('[controllers][entrance][signup]: HouseIdExist', existHouseId);

                // Return error when username exist

                if (existUser && existUser.length) {
                    return res.status(400).json({
                        errors: [
                            { code: 'USER_EXIST_ERROR', message: 'Username already exist !' }
                        ],
                    });
                }

                // Return error when email exist

                if (existEmail && existEmail.length) {
                    return res.status(400).json({
                        errors: [
                            { code: 'EMAIL_EXIST_ERROR', message: 'Email already exist !' }
                        ],
                    });
                }

                // Return error when mobileNo exist

                if (existMobile && existMobile.length) {
                    return res.status(400).json({
                        errors: [
                            { code: 'MOBILE_EXIST_ERROR', message: 'MobileNo already exist !' }
                        ],
                    });
                }

                // Return error when HouseId exist

                if (existHouseId && existHouseId.length) {
                    return res.status(400).json({
                        errors: [
                            { code: 'HOUSEID_EXIST_ERROR', message: 'House Id already exist !' }
                        ],
                    });
                }

                const currentTime = new Date().getTime();

                const updatedData = { ...payload, updatedAt: currentTime }

                let updatedUserResult = await knex.update(updatedData).where({ id: req.body.id }).returning(['*']).transacting(trx).into('users')
                user = updatedUserResult[0]
                trx.commit;
            })
            return res.status(200).json({
                data: {
                    user: user
                },
                message: 'User details updated successfully!'
            })
        } catch (err) {
            console.log('[controllers][serviceOrder][GetServiceOrderList] :  Error', err);
            trx.rollback;
            res.status(500).json({
                errors: [
                    { code: 'UNKNOWN_SERVER_ERROR', message: err.message }
                ],
            });
        }
    }
};

module.exports = usersController;