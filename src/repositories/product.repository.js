const CrudRepository = require("./crud.repository");
const { Product, sequelize } = require("../models");
const AppError = require("../utils/errors/app.error");
const { StatusCodes } = require("http-status-codes");
const { QueryTypes } = require("sequelize");
const { query } = require("express");
const { Op } = require("sequelize");

class ProductRepository extends CrudRepository {
    constructor() {
      super(Product);
    }

async updateProductModel(id, data, options={}){
  const response = await Product.update(data,{
    where:{
        id:id
    },
    transaction: options.transaction   
});
if(!response){
    throw new AppError('No resource found related to the corresponding details',StatusCodes.NOT_FOUND)
}
return response;
}

async findAllByIds(ids, options = {}) {
  return await Product.findAll({
    where: {
      id: {
        [Op.in]: ids
      }
    },
    ...options
  });
}

async bulkUpdate(updates, options = {}) {
  const promises = updates.map(update => 
    Product.update(
      { stock: update.stock },
      { 
        where: { id: update.id },
        ...options
      }
    )
  );
  
  return await Promise.all(promises);
}

}

module.exports = ProductRepository;