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

export class TodoSequelizeModel
  extends Model<ITodoAttributes, ITodoCreationAttributes>
  implements ITodoAttributes
{
  public id!: string;
  public title!: string;
  public completed!: boolean;
  public createdAt!: Date;
  public priority!: string;
  public dueDate?: Date;
}

export const initTodoModel = (sequelize: Sequelize): void => {
  // Get the dialect to handle database-specific configurations
  const dialect = sequelize.getDialect();

  // Define ENUM with database-specific handling
  let priorityType;
  if (dialect === 'postgres') {
    // PostgreSQL ENUM - create it properly
    priorityType = DataTypes.ENUM('low', 'medium', 'high');
  } else {
    // MySQL and SQLite
    priorityType = DataTypes.ENUM('low', 'medium', 'high');
  }

  TodoSequelizeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        // For PostgreSQL, let the database handle UUID generation if not provided
        defaultValue: dialect === 'postgres' ? DataTypes.UUIDV4 : undefined,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      priority: {
        type: priorityType,
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'due_date',
      },
    },
    {
      sequelize,
      tableName: 'todo',
      timestamps: false, // We handle createdAt manually
      // Database-specific options
      ...(dialect === 'postgres'
        ? {
            // PostgreSQL specific options
            schema: process.env.DB_SCHEMA || 'public',
          }
        : {}),
      indexes: [
        {
          fields: ['completed'],
        },
        {
          fields: ['created_at'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['due_date'],
        },
      ],
    }
  );
};
