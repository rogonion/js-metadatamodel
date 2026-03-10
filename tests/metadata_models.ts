import { core, path } from '@rogonion/js-json';
import { FieldGroupProperties, FieldTypes, FieldUIs, GroupJsonPathPrefix } from '@core';

// UserMetadataModel returns a metadata model for the User entity.
// It defines fields: ID, Name, Email.
export function UserMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'User';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.GroupFields]: [
            {
                ID: (() => {
                    const DefaultName = 'ID';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.IsPrimaryKey]: true
                    };
                })(),
                Name: (() => {
                    const DefaultName = 'Name';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })(),
                Email: (() => {
                    const DefaultName = 'Email';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Name', 'Email']
    };
}

// ProductMetadataModel returns a metadata model for the Product entity.
// It defines fields: ID, Name, Price.
export function ProductMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'Product';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.GroupFields]: [
            {
                ID: (() => {
                    const DefaultName = 'ID';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.IsPrimaryKey]: true
                    };
                })(),
                Name: (() => {
                    const DefaultName = 'Name';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })(),
                Price: (() => {
                    const DefaultName = 'Price';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Name', 'Price']
    };
}

// CompanyMetadataModel returns a metadata model for the Company entity.
// It defines fields: Name, Employees (nested UserMetadataModel).
export function CompanyMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'Company';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.GroupFields]: [
            {
                Name: (() => {
                    const DefaultName = 'Name';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.IsPrimaryKey]: true
                    };
                })(),
                Employees: (() => {
                    const DefaultName = 'Employees';
                    return UserMetadataModel({
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth + 1,
                        [FieldGroupProperties.DatabaseTableCollectionUid]: DefaultName,
                        [FieldGroupProperties.DatabaseTableCollectionName]: DefaultName
                    });
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['Name', 'Employees']
    };
}

// AddressMetadataModel returns a metadata model for the Address entity.
// It defines fields: Street, City, ZipCode.
export function AddressMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'Address';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.GroupFields]: [
            {
                Street: (() => {
                    const DefaultName = 'Street';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })(),
                City: (() => {
                    const DefaultName = 'City';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })(),
                ZipCode: (() => {
                    const DefaultName = 'ZipCode';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['Street', 'City', 'ZipCode']
    };
}

// UserProfileMetadataModel returns a metadata model for the UserProfile entity.
// It defines fields: Name, Age, Address (nested AddressMetadataModel).
export function UserProfileMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'UserProfile';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.GroupFields]: [
            {
                Name: (() => {
                    const DefaultName = 'Name';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.IsPrimaryKey]: true
                    };
                })(),
                Age: (() => {
                    const DefaultName = 'Age';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName
                    };
                })(),
                Address: (() => {
                    const AddressDefaultName = 'Address';
                    return AddressMetadataModel({
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + AddressDefaultName,
                        [FieldGroupProperties.Name]: AddressDefaultName,
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionUid]: DefaultName,
                        [FieldGroupProperties.DatabaseTableCollectionName]: DefaultName
                    });
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['Name', 'Age', 'Address']
    };
}

// EmployeeMetadataModel returns a metadata model for the Employee entity.
// It defines fields: ID, Profile (nested UserProfileMetadataModel), Skills.
export function EmployeeMetadataModel(rootProperties: core.JsonObject = {}): core.JsonObject {
    const DefaultName = 'Employee';

    if (!rootProperties) {
        rootProperties = {};
    }

    if (typeof rootProperties[FieldGroupProperties.JsonPathKey] !== 'string') {
        rootProperties[FieldGroupProperties.JsonPathKey] = path.JsonpathKeyRoot;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionName] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionName] = DefaultName;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseJoinDepth] !== 'number') {
        rootProperties[FieldGroupProperties.DatabaseJoinDepth] = 0;
    }

    if (typeof rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] !== 'string') {
        rootProperties[FieldGroupProperties.DatabaseTableCollectionUid] = DefaultName;
    }

    const fieldGroupJsonPathPrefixDepth0 =
        (rootProperties[FieldGroupProperties.JsonPathKey] as string) + GroupJsonPathPrefix;
    const databaseJoinDepth = rootProperties[FieldGroupProperties.DatabaseJoinDepth] as number;
    const databaseTableCollectionName = rootProperties[FieldGroupProperties.DatabaseTableCollectionName] as string;

    return {
        [FieldGroupProperties.JsonPathKey]: rootProperties[FieldGroupProperties.JsonPathKey],
        [FieldGroupProperties.Name]: DefaultName,
        [FieldGroupProperties.DatabaseJoinDepth]: rootProperties[FieldGroupProperties.DatabaseJoinDepth],
        [FieldGroupProperties.DatabaseTableCollectionName]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionName],
        [FieldGroupProperties.DatabaseTableCollectionUid]:
            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
        [FieldGroupProperties.GroupFields]: [
            {
                ID: (() => {
                    const DefaultName = 'ID';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Number,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Number,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.IsPrimaryKey]: true
                    };
                })(),
                Profile: (() => {
                    const DefaultName = 'Profile';
                    return UserProfileMetadataModel({
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth + 1,
                        [FieldGroupProperties.DatabaseTableCollectionUid]: DefaultName,
                        [FieldGroupProperties.DatabaseTableCollectionName]: DefaultName
                    });
                })(),
                Skills: (() => {
                    const DefaultName = 'Skills';
                    return {
                        [FieldGroupProperties.JsonPathKey]: fieldGroupJsonPathPrefixDepth0 + DefaultName,
                        [FieldGroupProperties.Name]: DefaultName,
                        [FieldGroupProperties.FieldDataType]: FieldTypes.Text,
                        [FieldGroupProperties.FieldUI]: FieldUIs.Text,
                        [FieldGroupProperties.DatabaseTableCollectionUid]:
                            rootProperties[FieldGroupProperties.DatabaseTableCollectionUid],
                        [FieldGroupProperties.DatabaseJoinDepth]: databaseJoinDepth,
                        [FieldGroupProperties.DatabaseTableCollectionName]: databaseTableCollectionName,
                        [FieldGroupProperties.DatabaseFieldColumnName]: DefaultName,
                        [FieldGroupProperties.MaxEntries]: 0
                    };
                })()
            }
        ],
        [FieldGroupProperties.GroupReadOrderOfFields]: ['ID', 'Profile', 'Skills']
    };
}
