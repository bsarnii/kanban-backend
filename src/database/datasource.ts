import { DataSource } from 'typeorm';
import { typeormConfig } from '../config/database.config';

const AppDataSource = new DataSource(typeormConfig);

export default AppDataSource;