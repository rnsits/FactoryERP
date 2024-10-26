const { where } = require("sequelize");
const AppError = require("../utils/errors/app.error");
const {StatusCodes} = require("http-status-codes");
const { Op } = require('sequelize');

class CrudRepository{
    constructor(model){
        this.model=model;
    }

    async create(data, options = {}){
            const response = await this.model.create(data,{ transaction: options.transaction });
            return response;
    }

    async destroy(data){
            const response = await this.model.destroy({
                where: {
                    id:data
                }
            })
            if(!response){
                throw new AppError('Not resource found with ',StatusCodes.NOT_FOUND)
            }
            return response;
    }

    async get(data) {
        const response = await this.model.findByPk(data);
        // return response||null;
            if(!response || response==null){
                throw new AppError('No resource found related to the corresponding details',StatusCodes.NOT_FOUND)
            }
            return response;
    }

    async getOne(data) {
        const response = await this.model.findOne(data);
        return response||null;
        if(!response || response==null) {
            throw new AppError('No resource found related to the corresponding details',StatusCodes.NOT_);
        }
        return response;
    }


    async getAll(){
            const response = await this.model.findAll()
            return response;
    }

    async getPendingInvoices(){
        const response = await this.model.findAll({
            where: {
                payment_status: "unpaid" || "partial-payment"
            }
        })
        return response || null;
    }

    async findAll(date){
        // Get date at midnight
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        // Get date at midnight
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const response = await this.model.findAll({
            where:{
                createdAt: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: endOfDay
                }
            },
            order: [['createdAt', 'DESC']] 
        })
        return response || null;
    }

    async findToday(){
        // Get today's date at midnight
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Get tomorrow's date at midnight
        const endOfDay = new Date();
        endOfDay.setHours(24, 0, 0, 0);
        const response = await this.model.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: endOfDay
                }
            },
            order: [['createdAt', 'DESC']]
        })
        return response || null;
    }

    async update(id,data, options={}){
            const response = await this.model.update(data,{
                where:{
                    id:id
                },
                transaction: options.transaction
            })
            if(response[0]===0){
                throw new AppError('No resource found related to the corresponding details',StatusCodes.NOT_FOUND)
            }
            return response;    
    }
}

module.exports = CrudRepository;