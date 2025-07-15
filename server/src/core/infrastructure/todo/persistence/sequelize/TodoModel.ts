import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ITodoAttributes {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: string;
  dueDate?: Date;
}

export interface ITodoCreationAttributes extends Omit<ITodoAttributes, 'id'> {
  id?: string;
}

export class TodoSequelizeModel extends Model<ITodoAttributes, ITodoCreationAttributes> 
  implements ITodoAttributes {
  public id!: string;
  public title!: string;
  public completed!: boolean;
  public createdAt!: Date;
  public priority!: string;
  public dueDate?: Date;
}

export const initTodoModel = (sequelize: Sequelize): void => {
  TodoSequelizeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'due_date'
      }
    },
    {
      sequelize,
      tableName: 'todo',
      timestamps: false, // We handle createdAt manually
      indexes: [
        {
          fields: ['completed']
        },
        {
          fields: ['created_at']
        },
        {
          fields: ['priority']
        },
        {
          fields: ['due_date']
        }
      ]
    }
  );
};