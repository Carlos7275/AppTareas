
export default () => (
    
    <IEnvConfig> {
        jwtSecret: process.env.jwtSecret,
        expireTime: process.env.expireTime,
        ignoreExpiration: evalBool(process.env.ignoreExpiration),
        ormConfig: {
            type: process.env.ormConfig_type,
            host: process.env.ormConfig_host,
            port: parseInt(process.env.ormConfig_port),
            username: process.env.ormConfig_username,
            password: process.env.ormConfig_password,
            database: process.env.ormConfig_database,
            logging: evalBool(process.env.ormConfig_logging),
            synchronize: evalBool(process.env.ormConfig_synchronize),
            entities: JSON.parse(process.env.ormConfig_entities),
            schema: process.env.ormConfig_schema,
            dropSchema:evalBool(process.env.ormConfig_synchronize)

        }
        
    }
);

function evalBool(value: string) {
    return value && value == "true" ? true : false;
}

export interface IEnvConfig {
    jwtSecret: string;
    expireTime: string;
    ignoreExpiration: boolean;
    ormConfig: IOrmConfig;
}

export interface IOrmConfig {
    type: any | "mysql" | "mariadb" | "postgres" | "cockroachdb" | "sqlite" | "mssql" | "sap" | "oracle" | "cordova" | "nativescript" | "react-native" | "sqljs" | "mongodb" | "aurora-mysql" | "spanner";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    logging: boolean;
    synchronize: boolean;
    entities: Array<string>;
    schema: string;
}