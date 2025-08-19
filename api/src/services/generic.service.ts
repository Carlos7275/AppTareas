import { GenericEntity } from 'src/entities/generic.entity';
import { Filter, Relacion } from 'src/types/filtros.type';
import {
    DeleteResult,
    FindManyOptions,
    Repository,
    FindOneOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class GenericService<Entity extends GenericEntity> {
    constructor(private readonly repository: Repository<Entity>) { }

    async create(entity: QueryDeepPartialEntity<Entity> | Entity) {
        return await this.repository.save(entity as Entity);
    }

    find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
        return this.repository.find(options);
    }

    findOne(options?: FindOneOptions<Entity>): Promise<Entity> {
        return this.repository.findOne(options);
    }

    findOneById(id): Promise<Entity> {
        return this.repository.findOne({ where: { id } });
    }

    async update(id, entity: any): Promise<any> {
        const info = await this.repository.findOne({ where: { id } });
        if (info) return this.repository.update(id, entity);
        return null;
    }

    softDelete(id: number): Promise<DeleteResult> {
        return this.repository.softDelete(id);
    }

    async paginate(
        page: number = 1,
        limit: number = 10,
        searchFields: string[] = [],
        search?: string,
        ignoreFields: string[] = [],
        relations?: Relacion[],
        filters?: Filter[]
    ): Promise<{ data: Entity[]; total: number }> {
        const queryBuilder = this.repository.createQueryBuilder('entity');

        const ignore = ignoreFields ?? [];

        const localIgnore = ignore.filter(f => !f.includes('.'));
        const relationIgnoreMap = new Map<string, Set<string>>();
        ignore
            .filter(f => f.includes('.'))
            .forEach(entry => {
                const [relation, field] = entry.split('.');
                if (!relationIgnoreMap.has(relation)) relationIgnoreMap.set(relation, new Set());
                relationIgnoreMap.get(relation)!.add(field);
            });

        const selectFields = this.repository.metadata.columns
            .map(col => col.propertyName)
            .filter(key => !localIgnore.includes(key))
            .map(key => `entity.${key}`);

        const relationSelectFields: string[] = [];

        if (relations) {
            for (const relation of relations) {
                switch (relation.type) {
                    case 'left':
                        queryBuilder.leftJoin(`entity.${relation.name}`, relation.name);
                        break;
                    case 'inner':
                        queryBuilder.innerJoin(`entity.${relation.name}`, relation.name);
                        break;
                }
                const metadata = this.repository.manager.connection.getMetadata(this.repository.metadata.target);
                const relationMetadata = metadata.relations.find(r => r.propertyName === relation.name);
                if (!relationMetadata) continue;


                const relatedEntity = this.repository.manager.connection.getMetadata(relationMetadata.type);
                const ignoreSet = relationIgnoreMap.get(relation.name) || new Set();
                for (const column of relatedEntity.columns) {
                    if (!ignoreSet.has(column.propertyName)) relationSelectFields.push(`${relation.name}.${column.propertyName}`);
                }
            }
        }

        queryBuilder.select([...selectFields, ...relationSelectFields]);
        if (limit > 0) {
            queryBuilder.take(limit);
            queryBuilder.skip((page - 1) * limit);

        }

        if (filters?.length) {
            let filterIndex = 0;
            for (const filter of filters) {
                if (filter.or && Array.isArray(filter.or)) {
                    const orConditions: string[] = [];
                    const parameters: Record<string, any> = {};
                    for (const subFilter of filter.or) {
                        const { field, operator, value } = subFilter;
                        const paramKey = `filter_${filterIndex++}`;
                        const fieldPath = field.includes('.') ? field : `entity.${field}`;
                        switch (operator) {
                            case 'eq':
                                orConditions.push(`${fieldPath} = :${paramKey}`);
                                parameters[paramKey] = value;
                                break;
                            case 'like':
                                orConditions.push(`${fieldPath} LIKE :${paramKey}`);
                                parameters[paramKey] = `%${value}%`;
                                break;
                            case 'in':
                                orConditions.push(`${fieldPath} IN (:...${paramKey})`);
                                parameters[paramKey] = value;
                                break;
                            case 'lt':
                                orConditions.push(`${fieldPath} < :${paramKey}`);
                                parameters[paramKey] = value;
                                break;
                            case 'gt':
                                orConditions.push(`${fieldPath} > :${paramKey}`);
                                parameters[paramKey] = value;
                                break;
                            default:
                                throw new Error(`Operador no soportado: ${operator}`);
                        }
                    }
                    if (orConditions.length) queryBuilder.andWhere(`(${orConditions.join(' OR ')})`, parameters);
                } else {
                    const { field, operator, value } = filter;
                    const paramKey = `filter_${filterIndex++}`;
                    const fieldPath = field.includes('.') ? field : `entity.${field}`;
                    switch (operator) {
                        case 'eq':
                            queryBuilder.andWhere(`${fieldPath} = :${paramKey}`, { [paramKey]: value });
                            break;
                        case 'lt':
                            queryBuilder.andWhere(`${fieldPath} < :${paramKey}`, { [paramKey]: value });
                            break;
                        case 'gt':
                            queryBuilder.andWhere(`${fieldPath} > :${paramKey}`, { [paramKey]: value });
                            break;
                        case 'like':
                            queryBuilder.andWhere(`${fieldPath} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                            break;
                        case 'in':
                            queryBuilder.andWhere(`${fieldPath} IN (:...${paramKey})`, { [paramKey]: value });
                            break;
                        default:
                            throw new Error(`Operador no soportado: ${operator}`);
                    }
                }
            }
        }

        if (search && searchFields?.length) {
            searchFields.forEach((field, index) => {
                const fieldPath = field.includes('.') ? field : `entity.${field}`;
                const condition = `${fieldPath} LIKE :search`;
                if (index === 0) queryBuilder.where(condition, { search: `%${search}%` });
                else queryBuilder.orWhere(condition, { search: `%${search}%` });
            });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }

    async deleteWhere(options?: FindManyOptions<Entity>) {
        const registros = await this.repository.find(options);
        if (registros.length) {
            await this.repository.remove(registros);
        }
        return registros;
    }
}
