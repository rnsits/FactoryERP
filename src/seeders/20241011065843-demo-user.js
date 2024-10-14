'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const hashedPassword = await bcrypt.hash('yourPlainPassword', 10); // Adjust the password as needed
    
    return queryInterface.bulkInsert('Users', [{
      username: 'testuser',
      password: hashedPassword,
      refreshToken: null, // Initially null
      pin: null,
      email: 'testuser@example.com',
      phone: "4585123456",
      auth_method: 'username_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', {
      username: 'testuser'
    }, {});
  }
};
