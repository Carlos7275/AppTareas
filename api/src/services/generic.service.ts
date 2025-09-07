import { GenericEntity } from 'src/entities/generic.entity';
import { Filter, Relacion } from 'src/types/filtros.type';
import {
    DeleteResult,
    FindManyOptions,
    Repository,
    FindOneOptions,
    Brackets,
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

    private buildQuery(
        ignoreFields: string[] = [],
        relations?: Relacion[],
        filters?: Filter[],
        search?: string,
        searchFields: string[] = [],
        skip?: number,
        take?: number,
        order?: Record<string, 'ASC' | 'DESC'>
    ) {
        const qb = this.repository.createQueryBuilder('entity');

        const localIgnore = ignoreFields.filter(f => !f.includes('.'));
        const relationIgnoreMap = new Map<string, Set<string>>();
        ignoreFields.filter(f => f.includes('.')).forEach(f => {
            const [rel, field] = f.split('.');
            if (!relationIgnoreMap.has(rel)) relationIgnoreMap.set(rel, new Set());
            relationIgnoreMap.get(rel)!.add(field);
        });

        const selectFields = this.repository.metadata.columns
            .map(c => c.propertyName)
            .filter(f => !localIgnore.includes(f))
            .map(f => `entity.${f}`);

        const relationSelectFields: string[] = [];
        if (relations) {
            for (const rel of relations) {
                qb.leftJoin(`entity.${rel.name}`, rel.name);
                const relMeta = this.repository.manager.connection
                    .getMetadata(this.repository.metadata.target)
                    .relations.find(r => r.propertyName === rel.name);
                if (!relMeta) continue;

                const relEntity = this.repository.manager.connection.getMetadata(relMeta.type);
                const ignoreSet = relationIgnoreMap.get(rel.name) || new Set();
                for (const col of relEntity.columns) {
                    if (!ignoreSet.has(col.propertyName)) relationSelectFields.push(`${rel.name}.${col.propertyName}`);
                }
            }
        }

        qb.select([...selectFields, ...relationSelectFields]);

        filters?.forEach((f, idx) => {
            const fieldPath = f.field.includes('.') ? f.field : `entity.${f.field}`;
            const paramKey = `filter_${idx}`;
            switch (f.operator) {
                case 'eq': qb.andWhere(`${fieldPath} = :${paramKey}`, { [paramKey]: f.value }); break;
                case 'lt': qb.andWhere(`${fieldPath} < :${paramKey}`, { [paramKey]: f.value }); break;
                case 'gt': qb.andWhere(`${fieldPath} > :${paramKey}`, { [paramKey]: f.value }); break;
                case 'like': qb.andWhere(`${fieldPath} LIKE :${paramKey}`, { [paramKey]: `%${f.value}%` }); break;
                case 'in': qb.andWhere(`${fieldPath} IN (:...${paramKey})`, { [paramKey]: f.value }); break;
            }
        });

        if (search && searchFields.length) {
            qb.andWhere(new Brackets(qbSearch => {
                searchFields.forEach((field, index) => {
                    const fp = field.includes('.') ? field : `entity.${field}`;
                    if (index === 0) qbSearch.where(`${fp} LIKE :search`, { search: `%${search}%` });
                    else qbSearch.orWhere(`${fp} LIKE :search`, { search: `%${search}%` });
                });
            }));
        }

        if (take !== undefined) qb.take(take);
        if (skip !== undefined) qb.skip(skip);

        if (order) {
            for (const [col, dir] of Object.entries(order)) {
                const field = col.includes('.') ? col : `entity.${col}`;
                qb.addOrderBy(field, dir);
            }
        } else {
            qb.addOrderBy('entity.id', 'ASC');
        }

        return qb;
    }


    async paginate(
        page = 1,
        limit = 10,
        searchFields: string[] = [],
        search?: string,
        ignoreFields: string[] = [],
        relations?: Relacion[],
        filters?: Filter[],
        order?: Record<string, 'ASC' | 'DESC'>
    ): Promise<{ data: Entity[]; total: number }> {
        const offset = (page - 1) * limit;
        const qb = this.buildQuery(ignoreFields, relations, filters, search, searchFields, offset, limit, order);


        const totalQb = this.buildQuery(ignoreFields, relations, filters, search, searchFields, offset, limit, order);

        const [data, total] = await Promise.all([
            qb.getMany(),
            totalQb.getCount()
        ]);

        return { data, total };
    }

    async *paginateGenerator(
        batchSize = 1000,
        searchFields: string[] = [],
        search?: string,
        ignoreFields: string[] = [],
        relations?: Relacion[],
        filters?: Filter[],
        order?: Record<string, 'ASC' | 'DESC'>
    ) {
        const totalQb = this.buildQuery(ignoreFields, relations, filters, search, searchFields);
        const total = await totalQb.getCount();

        let page = 0;

        while (true) {
            const qb = this.buildQuery(
                ignoreFields,
                relations,
                filters,
                search,
                searchFields,
                page * batchSize,
                batchSize,
                order
            );

            const data = await qb.getMany();
            if (!data.length) break;

            for (const item of data) yield { total, valor: item };
            page++;
        }
    }


    async deleteWhere(options?: FindManyOptions<Entity>) {
        const registros = await this.repository.find(options);
        if (registros.length) {
            await this.repository.remove(registros);
        }
        return registros;
    }
}
