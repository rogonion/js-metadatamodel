export const UnflattenErrorCodes = {
    /**
     * Defualt error for field columns module.
     */
    UnflattenError: 'unflattening encountered an error',
    /**
     * For when {@link RecursiveGroupIndexTree.MmPropGroupFields} is empty if field is a group.
     */
    NoGroupFields: 'no group fields to extract found'
} as const;
export type UnflattenErrorCode = (typeof UnflattenErrorCodes)[keyof typeof UnflattenErrorCodes];
