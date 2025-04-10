import { DataTypes } from 'sequelize';
import sequelize from '../config/bd.js';

const Order = sequelize.define('Order', {
  paypal_order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'fk_user',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payer_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  creation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'creationDate',
  }
}, {
  tableName: 'orders',
  timestamps: false,
});

export default Order;
