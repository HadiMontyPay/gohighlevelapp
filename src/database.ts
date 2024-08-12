import { Sequelize } from "sequelize";

// Initialize Sequelize
const sequelize = new Sequelize(
  "funnel_fussion_db",
  "FunnelFusion",
  "FunnelFusion@123",
  {
    host: "44.226.145.213",
    dialect: "mysql",
  }
);

export default sequelize;
