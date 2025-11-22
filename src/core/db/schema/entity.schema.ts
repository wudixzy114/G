import type {RxJsonSchema} from "rxdb";

/**
 * The literal definition of the entity schema.
 * This is used to define the structure of the entity documents in the database.
 */
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

/**
 * The RxDB schema for the entity collection.
 */
export const EntitySchema: RxJsonSchema<any> = ENTITY_SCHEMA_LITERAL;