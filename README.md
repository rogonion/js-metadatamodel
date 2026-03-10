# js-metadatamodel

`js-metadatamodel` is a TypeScript library designed to manipulate, transform, and query complex data structures using a declarative Metadata Model. It provides tools for flattening/unflattening nested data, filtering, extracting column definitions, and handling database-like operations on in-memory objects.

## Sections

- Prerequisites
- Installation
- Environment Setup
- Modules
    - Database
    - Field Columns
    - Filter
    - Flattener
    - Iteration
    - Unflattener

## Prerequisites

Ensure you have the following installed on your system. This project supports Linux, macOS, and Windows (via WSL2).

<table>
  <thead>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Node.js</td>
      <td>JavaScript runtime used for the project.</td>
      <td><a href="https://nodejs.org/">Official Website</a></td>
    </tr>
    <tr>
      <td>Task</td>
      <td>
        <p>Task runner / build tool.</p> 
        <p>You can use the provided shell script <a href="taskw">taskw</a> that automatically downloads the binary and install it in the <code>.task</code> folder.</p>
      </td>
      <td><a href="https://taskfile.dev/">Official Website</a></td>
    </tr>
    <tr>
      <td>Docker / Podman</td>
      <td>Optional container engine for isolated development environment.</td>
      <td><a href="https://www.docker.com/">Docker</a> / <a href="https://podman.io/">Podman</a></td>
    </tr>
  </tbody>
</table>

After building the dev container, below is a sample script that runs the container and mounts the project directory into the container:

```shell
#!/bin/bash

CONTAINER_ENGINE="podman"
CONTAINER="projects-js-metadatamodel"
NETWORK="systemd-leap"
NETWORK_ALIAS="projects-js-metadatamodel"
CONTAINER_UID=1000
IMAGE="localhost/projects/js-metadatamodel:latest"
SSH_PORT="127.0.0.1:2200" # for local proxy vscode ssh access
PROJECT_DIRECTORY="$(pwd)"

# Check if container exists (Running or Stopped)
if $CONTAINER_ENGINE ps -a --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
    echo "   Found existing container: $CONTAINER"
    # Check if it is currently running
    if $CONTAINER_ENGINE ps --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
        echo "✅ Container is already running."
    else
        echo "🔄 Container stopped. Starting it..."
        $CONTAINER_ENGINE start $CONTAINER
        echo "✅ Started."
    fi
else
    # Container doesn't exist -> Create and Run it
    echo "🆕 Container not found. Creating new..."
    $CONTAINER_ENGINE run -d \
    # start container from scratch
    # `sudo` is used because systemd-leap network was created in `sudo`
    # Ensure container image exists in `sudo`
    # Not needed if target network is not in `sudo`
    sudo podman run -d \
        --name $CONTAINER \
        --network $NETWORK \
        --network-alias $NETWORK_ALIAS \
        --user $CONTAINER_UID:$CONTAINER_UID \
        -p $SSH_PORT:22 \
        -v $PROJECT_DIRECTORY:/home/dev/js-metadatamodel:Z \
        $IMAGE
    echo "✅ Created and Started."
fi
```

## Installation

```shell
npm install @rogonion/js-metadatamodel
```

## Environment Setup

This project uses `Taskfile` to manage the development environment and tasks.

<table>
  <thead>
    <tr>
      <th>Task</th>
      <th>Description</th>
      <th>Usage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>env:build</code></td>
      <td>
        <p>Build the dev container image.</p>
        <p>Image runs an ssh server one can connect to with vscode.</p>
      </td>
      <td><code>task env:build</code></td>
    </tr>
    <tr>
      <td><code>env:info</code></td>
      <td>Show current environment configuration.</td>
      <td><code>task env:info</code></td>
    </tr>
    <tr>
      <td><code>deps</code></td>
      <td>Download and tidy dependencies.</td>
      <td><code>task deps</code></td>
    </tr>
    <tr>
      <td><code>test</code></td>
      <td>Run tests.</td>
      <td><code>task test</code></td>
    </tr>
    <tr>
      <td><code>format</code></td>
      <td>Format code.</td>
      <td><code>task format</code></td>
    </tr>
    <tr>
      <td><code>build</code></td>
      <td>Compile into <code>dist</code> folder.</td>
      <td><code>task build</code></td>
    </tr>
  </tbody>
</table>
## Modules

### Database

This module can be used to work with data (get, set, delete) whose metadata model represents a relational
database structure
using the following field/group properties:

- core.DatabaseTableCollectionUid
- core.DatabaseJoinDepth
- core.DatabaseTableCollectionName
- core.DatabaseFieldColumnName

Example usage:

#### Get Column Fields

Retrieve column fields information from a metadata model.

```typescript
import { core } from '@rogonion/js-json';
import { GetColumnFields, ColumnFields } from '@database';

// Set metadata model
let metadataModel: core.JsonObject = {};

const gcf = new GetColumnFields();

// Set
gcf.TableCollectionUID = '_12xoP1y';
// Or
gcf.JoinDepth = 1;
gcf.TableCollectionName = 'User';

let columnFields: ColumnFields;
try {
    columnFields = gcf.Get(metadataModel);
} catch (e) {
    // handle error
}
```

#### Field Value

A set of methods to get, set, and delete value(s) in a source object using database properties in the metadata model.

Module uses js-json for actual data manipulation.

```typescript
import { core, jsobject, schema } from '@rogonion/js-json';
import { GetColumnFields, FieldValue, ColumnFields } from '@database';

class Product {
    ID: number[] = [1];
    Name: string[] = [];
    Price: number[] = [];
}

// Set Product schema. Useful for instantiating nested collections
let sch: schema.Schema;

// Source object
const product = new Product();

// source data to manipulate
const obj = new jsobject.JSObject();
obj.Source = product;
obj.Schema = sch;

// Set product metadata model
let productMetadataModel: core.JsonObject = {};

const gcf = new GetColumnFields();
gcf.JoinDepth = 0;
gcf.TableCollectionName = 'Product';
const columnFields = gcf.Get(productMetadataModel);

// Module to perform get,set, or delete
const fieldValue = new FieldValue(obj, columnFields);

// Get value of column `ID`
const [res, ok] = fieldValue.Get('ID', '', null);

// Set value for column `Name`
const noOfModifications = fieldValue.Set('Name', 'Twinkies', '', null);

// Delete value for column `Price`
const noOfModificationsDelete = fieldValue.Delete('Price', '', null);
```

### Field Columns

This [module](fieldcolumns) can be used to extract fields from a metadata model into a structure that resembles columns in a table.

It can:

- Extract field properties into an ordered slice of fields, resembling columns in a table -> ColumnFields.
- Set the new read order of column fields after repositioning -> ColumnFields.Reposition.
- Set column fields to skip based on core.FieldGroupPropertiesMatch -> ColumnFields.Skip.

Example usage:

```typescript
import { core } from '@rogonion/js-json';
import { Extraction, ColumnFields } from '@fieldcolumns';
import { FieldGroupPropertiesMatch } from '@core';

// Set metadata model
let metadataModel: core.JsonObject = {};

// Module for extracting fields
const fcExtraction = new Extraction(metadataModel);

const columnFields = fcExtraction.Extract();

// Using ColumnFields.RepositionFieldColumns, reorder ColumnFields.CurrentIndexOfReadOrderOfColumnFields
columnFields.Reposition();

// if field property does not match, skip it
let add: FieldGroupPropertiesMatch;

// if a field property matches, skip
let skip: FieldGroupPropertiesMatch;

// update ColumnField.Skip of each ColumnFields.Fields
columnFields.Skip(skip, add);
```

### Filter

This [module](filter) can be used to filter through data with a metadata model structure.

Designed to support both simple queries and deeply nested logical operator queries which are extensible and customizable.

Below is a sample query condition structure:

```json
{
    /* The current query condition context: Can be 'LogicalOperator' for nesting or 'FieldGroup' for the actual filter condition */
    "Type": "LogicalOperator",
    "Negate": false,
    "LogicalOperator": "And",
    // Can be 'And' or 'Or'. Default 'And'.
    "Value": [
        {
            "Type": "LogicalOperator",
            "LogicalOperator": "Or",
            "Value": [
                {
                    "Type": "FieldGroup",
                    "Negate": false,
                    "LogicalOperator": "And",
                    "Value": {
                        "$.GroupFields[*].Bio": {
                            "EqualTo": {
                                "AssumedFieldType": "Any",
                                "Values": [true, "Yes"]
                            }
                        }
                    }
                },
                {
                    "Type": "FieldGroup",
                    "Negate": false,
                    "LogicalOperator": "And",
                    "Value": {
                        "$.GroupFields[*].Bio": {
                            "EqualTo": {
                                "AssumedFieldType": "Text",
                                "Negate": true,
                                "Value": "no"
                            }
                        },
                        "$.GroupFields[*].Occ": {
                            "EqualTo": {
                                "AssumedFieldType": "Text",
                                "Negate": true,
                                "Value": "no"
                            }
                        }
                    }
                }
            ]
        },
        {
            "Type": "FieldGroup",
            "Value": {
                "$.GroupFields[*].SiteAndGeoreferencing.GroupFields[*].Country": {
                    "FullTextSearchQuery": {
                        "AssumedFieldType": "Text",
                        "Value": "Kenya",
                        "ExactMatch": true
                    }
                }
            }
        },
        {
            "Type": "FieldGroup",
            "Negate": false,
            "LogicalOperator": "And",
            "Value": {
                "$.GroupFields[*].SiteAndGeoreferencing.GroupFields[*].Sites.GroupFields[*].Coordinates.GroupFields[*].Latitude": {
                    /*
          Default processed as 'And' logical operation.          
          The key should be a unique filter condition in the system while the value is an object with the relevant filter condition value.
          */
                    "GreaterThan": {
                        "AssumedFieldType": "Number",
                        "Value": 20.0
                    },
                    "LessThan": {
                        "AssumedFieldType": "Number",
                        "Value": 21.0
                    }
                }
            }
        }
    ]
}
```

Example usage:

```typescript
import { core, jsobject } from '@rogonion/js-json';
import { DataFilter } from '@filter';

// Set metadata model
let metadataModel: core.JsonObject = {};

// Set source data
let sourceData: jsobject.JSObject;

// Set query condition
let queryCondition: core.JsonObject;

// Set other properties using builder pattern 'With' or 'Set'. Refer to filter.DataFilter structure.
const filterData = new DataFilter(sourceData, metadataModel);

const filterExcludeIndexes = filterData.Filter(queryCondition, '', '');
```

### Flattener

This module converts deeply nested data structures into flat 2D tables based on a Metadata Model.

It acts as a "Projection" engine, capable of:

- Recursively flattening nested objects/arrays.
- Generating Cartesian products for one-to-many relationships.
- Pivoting specific fields into horizontal columns.

Example usage:

```typescript
import { core, jsobject } from '@rogonion/js-json';
import { Flattener } from '@flattener';

// ... setup metadataModel ...

// 1. Initialize
const f = new Flattener(metadataModel);

// 2. Flatten Source
const sourceObj = new jsobject.JSObject();
sourceObj.Source = myData;
f.Flatten(sourceObj);

// 3. Get Results (Raw Table)
const table = f.GetResult();

// 4. Or Write to Destination (Object)
const destObj = new jsobject.JSObject();
destObj.Source = [];
f.WriteToDestination(destObj);
```

### Iteration

This module provides higher-order functions processing the fields in a metadata model.

Provides the following methods:

- Filter
- For Each
- Map

Example usage:

#### Filter

```typescript
import { core } from '@rogonion/js-json';
import { FieldGroupName } from '@core';
import { Filter } from '@iter';

let sourceMetadataModel: any = {}; // AddressMetadataModel(null)

const updatedMetadataModel = Filter(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
    if (typeof fieldGroup[FieldGroupName] === 'string') {
        if ((fieldGroup[FieldGroupName] as string).endsWith('Name')) {
            return [false, false];
        }
    }
    return [true, false];
});
```

#### Map

```typescript
import { core } from '@rogonion/js-json';
import { FieldGroupName } from '@core';
import { Map } from '@iter';

let sourceMetadataModel: any = {}; // AddressMetadataModel(null)

const updatedMetadataModel = Map(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
    if (typeof fieldGroup[FieldGroupName] === 'string') {
        const fieldGroupName = fieldGroup[FieldGroupName] as string;
        if (fieldGroupName.endsWith('Code')) {
            fieldGroup[FieldGroupName] = fieldGroupName + ' Found';
        }
    }
    return [fieldGroup, false];
});
```

#### For Each

```typescript
import { core } from '@rogonion/js-json';
import { ForEach } from '@iter';

let sourceMetadataModel: any = {}; // AddressMetadataModel(null)

let noOfIterations = 0;

ForEach(sourceMetadataModel, (fieldGroup: core.JsonObject) => {
    noOfIterations++;
    return [false, false];
});
```

### Unflattener

This module converts a 2D array/slice (FlattenedTable) back into a slice of complex objects.

It is the inverse of the Flattener, reconstructing hierarchies using Primary Keys defined in the Metadata Model.

Example usage:

```typescript
import { core, jsobject } from '@rogonion/js-json';
import { Unflattener, Signature } from '@unflattener';

// ... setup metadataModel ...

// 1. Initialize with Signature generator
const sig = new Signature();
const u = new Unflattener(metadataModel, sig);

// 2. Prepare Destination
const destObj = new jsobject.JSObject();
destObj.Source = []; // or new MyStruct[]
u.Destination = destObj;

// 3. Unflatten
// sourceTable is any[][] (from flattener)
u.Unflatten(sourceTable);
```
