import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const credentials = {};
if (process.env.NODE_ENV !== 'production') {
  credentials['host'] = process.env.DATABASE_HOST;
  credentials['port'] = Number(process.env.DATABASE_PORT);
  credentials['username'] = process.env.DATABASE_USER;
  credentials['password'] = process.env.DATABASE_PASSWORD;
  credentials['database'] = process.env.DATABASE_NAME;
  credentials['ssl'] = false;
} else {
  credentials['url'] = process.env.DATABASE_URL;
  credentials['ssl'] = { rejectUnauthorized: false };
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...credentials,
  entities: ['dist/../**/*.entity.js'],
  synchronize: true,
  subscribers: [],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
