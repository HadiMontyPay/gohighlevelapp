import { Sequelize } from "sequelize";

// Initialize Sequelize
const sequelize = new Sequelize(
  "funnel_fussion_db",
  "FunnelFusion",
  "FunnelFusion@123",
  {
    host: "92.205.1.205",
    dialect: "mysql",
  }
);

export default sequelize;
