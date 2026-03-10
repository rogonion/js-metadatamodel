/**
 * Metadata Model Field/Group Properties.
 */
export const FieldGroupProperties = {
    /**
     * Stores the JSON Path to the value in the source object.
     */
    JsonPathKey: 'FieldGroupJsonPathKey',
    /**
     * The display name of the field or group.
     */
    Name: 'FieldGroupName',
    /**
     * The description of the field or group.
     */
    Description: 'FieldGroupDescription',
    /**
     * Indicates if the column should be locked/frozen in a table view.
     */
    ViewTableLockColumn: 'FieldGroupViewTableLockColumn',
    /**
     * Indicates if the field is a primary key.
     */
    IsPrimaryKey: 'FieldGroupIsPrimaryKey',

    /**
     * For when you want to view the individual values in an array/slice of a field or non-nested group in separate columns in a flat/table.
     *
     * By default:
     * * Fields with multiple values will be joined as a string separated by a comma or FieldMultipleValuesJoinSymbol.
     * * Groups will appear as separate rows in a matrix.
     */
    ViewValuesInSeparateColumns: 'FieldGroupViewValuesInSeparateColumns',
    /**
     * The maximum number of columns to generate when pivoting array values.
     */
    ViewMaxNoOfValuesInSeparateColumns: 'FieldGroupViewMaxNoOfValuesInSeparateColumns',
    /**
     * The format string used to generate headers for pivoted columns (e.g., "Address %d").
     */
    FieldViewValuesInSeparateColumnsHeaderFormat: 'FieldViewValuesInSeparateColumnsHeaderFormat',
    /**
     * The index of the specific pivoted column (0-based).
     */
    FieldViewValuesInSeparateColumnsHeaderIndex: 'FieldViewValuesInSeparateColumnsHeaderIndex',
    /**
     * The symbol used to join multiple values into a single string if not pivoted.
     */
    FieldMultipleValuesJoinSymbol: 'FieldMultipleValuesJoinSymbol',
    /**
     * Disable input for this field.
     */
    InputDisable: 'FieldGroupInputDisable',
    /**
     * The key to disable editing of the field's properties.
     */
    DisablePropertiesEdit: 'FieldGroupDisablePropertiesEdit',
    /**
     * The key to hide the field from the view.
     */
    ViewDisable: 'FieldGroupViewDisable',
    /**
     * The key to disable editing of query conditions for this field.
     */
    QueryConditionsEditDisable: 'FieldGroupQueryConditionsEditDisable',
    /**
     * The key for the maximum number of entries allowed.
     */
    MaxEntries: 'FieldGroupMaxEntries',

    /**
     * The key for the data type of the field (e.g., Text, Number).
     */
    FieldDataType: 'FieldDataType',
    /**
     * The key for the UI component type (e.g., Text, Select).
     */
    FieldUI: 'FieldUi',

    /**
     * For setting a custom position for field/group when working with data in a flat2D
     */
    FieldColumnPosition: 'FieldColumnPosition',
    /**
     * The key to indicate if the field should be positioned before another specific field.
     */
    PositionBefore: 'FieldGroupPositionBefore',

    /**
     * The key for properties specific to 'Any' type fields.
     */
    TypeAny: 'FieldGroupTypeAny',
    /**
     * The key for the value to store when a checkbox is checked.
     */
    FieldCheckboxValueIfTrue: 'FieldCheckboxValueIfTrue',
    /**
     * The key for the value to store when a checkbox is unchecked.
     */
    FieldCheckboxValueIfFalse: 'FieldCheckboxValueIfFalse',
    /**
     * The key to indicate if specific values should be used in the view for checkboxes.
     */
    FieldCheckboxValuesUseInView: 'FieldCheckboxValuesUseInView',
    /**
     * The key to indicate if specific values should be used in storage for checkboxes.
     */
    FieldCheckboxValuesUseInStorage: 'FieldCheckboxValuesUseInStorage',
    /**
     * The key for the input placeholder text.
     */
    FieldInputPlaceholder: 'FieldInputPlaceholder',
    /**
     * The key for the date/time format string.
     */
    FieldDatetimeFormat: 'FieldDatetimeFormat',
    /**
     * The key for the list of options in a select/dropdown.
     */
    FieldSelectOptions: 'FieldSelectOptions',
    /**
     * The key for a placeholder value.
     */
    FieldPlaceholder: 'FieldPlaceholder',
    /**
     * The key for the default value of the field.
     */
    FieldDefaultValue: 'FieldDefaultValue',

    /**
     * The key to indicate if the group should be viewed as a 2D table.
     */
    GroupViewTableIn2D: 'GroupViewTableIn2D',
    /**
     * The key to add a full-text search box for the group.
     */
    GroupQueryAddFullTextSearchBox: 'GroupQueryAddFullTextSearchBox',
    /**
     * The key to treat a group as a single field during extraction (no recursion).
     */
    GroupExtractAsSingleField: 'GroupExtractAsSingleField',
    /**
     * The key for the array defining the order of fields in the group.
     */
    GroupReadOrderOfFields: 'GroupReadOrderOfFields',
    /**
     * The key for the map containing the child fields of the group.
     */
    GroupFields: 'GroupFields',

    /**
     * The key to indicate if the field should be added to the full-text search index.
     */
    DatabaseAddDataToFullTextSearchIndex: 'DatabaseFieldAddDataToFullTextSearchIndex',
    /**
     * The key to skip this field during database extraction.
     */
    DatabaseSkipDataExtraction: 'DatabaseSkipDataExtraction',
    /**
     * Unique id for a set of fields that belong to the same DatabaseTableCollectionName especially in a join query.
     *
     * Useful especially if metadatamodel/query contains more than one instance of DatabaseTableCollectionName group.
     */
    DatabaseTableCollectionUid: 'DatabaseTableCollectionUid',
    /**
     * Name of table/collection that field/group belongs to.
     */
    DatabaseTableCollectionName: 'DatabaseTableCollectionName',
    /**
     * Name of field in database.
     *
     * DatabaseFieldColumnName Ensure it is unique in a set of fields for a particular DatabaseTableCollectionName
     */
    DatabaseFieldColumnName: 'DatabaseFieldColumnName',
    /**
     * Represents the join level.
     *
     * `0` represents no join while any number below `0` represents infinite join while any number above `0` represents max join.
     *
     * When combined with DatabaseTableCollectionName, it can form an alternative for a unique DatabaseTableCollectionUid.
     */
    DatabaseJoinDepth: 'DatabaseJoinDepth',
    /**
     * Return unique DatabaseFieldColumnName results if `true`.
     */
    DatabaseDistinct: 'DatabaseDistinct',
    /**
     * Sort DatabaseFieldColumnName in ascending order if `true`.
     */
    DatabaseSortByAsc: 'DatabaseSortByAsc',
    /**
     * Maximum number of results to return from a database query
     */
    DatabaseLimit: 'DatabaseLimit',
    /**
     * Number of results to skip in database query.
     */
    DatabaseOffset: 'DatabaseOffset',

    /**
     * The key for the datum input view.
     */
    DatumInputView: 'DatumInputView'
} as const;
export type FieldGroupProperty = (typeof FieldGroupProperties)[keyof typeof FieldGroupProperties];

/**
 * Properties for FieldUiSelect, Query condition value, etc
 */
export const CommonProperties = {
    Label: 'Label',
    Type: 'Type',
    Value: 'Value'
} as const;
export type CommonProperty = (typeof CommonProperties)[keyof typeof CommonProperties];

/**
 * Filter Condition additional props
 */
export const FilterConditionProperties = {
    Negate: 'FilterConditionNegate',
    Condition: 'FilterCondition',
    FieldGroup: 'FieldGroup'
} as const;
export type FilterConditionProperty = (typeof FilterConditionProperties)[keyof typeof FilterConditionProperties];

/**
 * Field of type FieldTypeAny properties
 */
export const FieldAnyProperties = {
    MetadataModelActionID: 'MetadataModelActionID',
    PickMetadataModelMessagePrompt: 'PickMetadataModelMessagePrompt',
    GetMetadataModelPathToDataArgument: 'GetMetadataModelPathToDataArgument'
} as const;
export type FieldAnyProperty = (typeof FieldAnyProperties)[keyof typeof FieldAnyProperties];

/**
 * Field type properties
 */
export const FieldTypes = {
    Text: 'Text',
    Number: 'Number',
    Boolean: 'Boolean',
    Timestamp: 'Timestamp',
    Any: 'Any'
} as const;
export type FieldType = (typeof FieldTypes)[keyof typeof FieldTypes];

/**
 * Field UI properties
 */
export const FieldUIs = {
    Text: 'Text',
    TextArea: 'TextArea',
    Number: 'Number',
    Checkbox: 'Checkbox',
    Select: 'Select',
    Datetime: 'DateTime'
} as const;
export type FieldUI = (typeof FieldUIs)[keyof typeof FieldUIs];

/**
 * Date Time Formats for field type FieldTypeTimestamp
 */
export const FieldDatetimeFormats = {
    YYYYMMDDHHMM: 'yyyy-mm-dd hh:mm',
    YYYYMMDD: 'yyyy-mm-dd',
    YYYYMM: 'yyyy-mm',
    YYYY: 'yyyy',
    MM: 'mm',
    HHMM: 'hh:mm'
} as const;
export type FieldDatetimeFormat = (typeof FieldDatetimeFormats)[keyof typeof FieldDatetimeFormats];
