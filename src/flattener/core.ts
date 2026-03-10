export const FlattenErrorCodes = {
    /**
     * Defualt error for flattening module.
     */
    FlattenError: 'flattening encountered an error',
    /**
     * For when {@link RecursiveIndexTree.GroupFields} is empty if field is a group.
     */
    NoGroupFields: 'no group fields to extract found'
} as const;
export type FlattenErrorCode = (typeof FlattenErrorCodes)[keyof typeof FlattenErrorCodes];
