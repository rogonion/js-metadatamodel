import { schema } from '@rogonion/js-json';
import { User, Product, Company, Address, UserProfile, Employee } from './types';

export function UserSchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new User();
    s.DefaultValue = function () {
        return new User();
    };
    s.ChildNodes = {
        ID: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.Number;
                return s;
            })();
            return s;
        })(),
        Name: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        Email: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })()
    };
    return s;
}

export function ProductSchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new Product();
    s.DefaultValue = function () {
        return new Product();
    };
    s.ChildNodes = {
        ID: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.Number;
                return s;
            })();
            return s;
        })(),
        Name: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        Price: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.Number;
                return s;
            })();
            return s;
        })()
    };
    return s;
}

export function CompanySchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new Company();
    s.DefaultValue = function () {
        return new Company();
    };
    s.ChildNodes = {
        Name: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        Employees: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = UserSchema();
            return s;
        })()
    };
    return s;
}

export function AddressSchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new Address();
    s.DefaultValue = function () {
        return new Address();
    };
    s.ChildNodes = {
        Street: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        City: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        ZipCode: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })()
    };
    return s;
}

export function UserProfileSchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new UserProfile();
    s.DefaultValue = function () {
        return new UserProfile();
    };
    s.ChildNodes = {
        Name: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })(),
        Age: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.Number;
                return s;
            })();
            return s;
        })(),
        Address: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = AddressSchema();
            return s;
        })()
    };
    return s;
}

export function EmployeeSchema(): schema.DynamicSchemaNode {
    const s = new schema.DynamicSchemaNode();
    s.Kind = schema.DataKind.Object;
    s.TypeOf = typeof new Employee();
    s.DefaultValue = function () {
        return new Employee();
    };
    s.ChildNodes = {
        ID: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.Number;
                return s;
            })();
            return s;
        })(),
        Profile: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = UserProfileSchema();
            return s;
        })(),
        Skills: (function (): schema.DynamicSchemaNode {
            const s = new schema.DynamicSchemaNode();
            s.Kind = schema.DataKind.Array;
            s.ChildNodesLinearCollectionElementsSchema = (function (): schema.DynamicSchemaNode {
                const s = new schema.DynamicSchemaNode();
                s.Kind = schema.DataKind.String;
                return s;
            })();
            return s;
        })()
    };
    return s;
}
