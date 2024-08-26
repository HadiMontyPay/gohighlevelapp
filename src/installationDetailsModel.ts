import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./database"; // Adjust path if necessary

// Define the interface for the model attributes
interface InstallationDetailsAttributes {
  id?: number;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  userType: string;
  companyId?: string;
  locationId?: string;
  merchantKey?: string;
  merchantPass?: string;
  TestmerchantKey?: string;
  TestmerchantPass?: string;
}

// Define the model
class InstallationDetails
  extends Model<InstallationDetailsAttributes>
  implements InstallationDetailsAttributes
{
  public id!: number;
  public access_token!: string;
  public token_type!: string;
  public expires_in!: number;
  public refresh_token!: string;
  public scope!: string;
  public userType!: string;
  public companyId?: string;
  public locationId?: string;
  public merchantKey?: string;
  public merchantPass?: string;
  public TestmerchantKey?: string;
  public TestmerchantPass?: string;
}

// Initialize the model
InstallationDetails.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merchantKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merchantPass: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TestmerchantKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TestmerchantPass: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "installation_details",
  }
);

export default InstallationDetails;
