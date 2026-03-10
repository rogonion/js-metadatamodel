export const DatabaseErrorCodes = {
    /**
     * Default error.
     */
    DatabaseError: 'database error',
    /**
     * Base error for when {@link GetColumnFields.Get} fails.
     */
    GetColumnFieldsError: 'database get column fields error',
    /**
     * For when {@link FieldValue} fails.
     */
    FieldValueError: 'database manipulate field value error'
} as const;
export type DatabaseErrorCode = (typeof DatabaseErrorCodes)[keyof typeof DatabaseErrorCodes];
