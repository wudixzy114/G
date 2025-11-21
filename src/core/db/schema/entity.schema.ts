import type {RxJsonSchema} from "rxdb";

export const ENTITY_SCHEMA_LITERAL = {
    title: 'entity schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        components: {
            type: 'object',
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    },
    required: ['id', 'components', 'tags']
} as const;

export const EntitySchema: RxJsonSchema<any> = ENTITY_SCHEMA_LITERAL;
