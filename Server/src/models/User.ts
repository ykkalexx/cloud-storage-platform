import { Model, DataTypes, Sequelize } from "sequelize";

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: "user" | "admin";

  public static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM("user", "admin"),
          defaultValue: "user",
        },
      },
      {
        sequelize,
        tableName: "users",
      }
    );
  }
}
