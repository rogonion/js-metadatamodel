/**
 * User represents a simple user entity with basic fields.
 */
export class User {
    public ID: number[] = [];
    public Name: string[] = [];
    public Email: string[] = [];
}

/**
 * Product represents a product with ID, Name, and Price.
 */
export class Product {
    public ID: number[] = [];
    public Name: string[] = [];
    public Price: number[] = [];
}

/**
 * Company represents a company entity containing a list of employees.
 */
export class Company {
    public Name: string[] = [];
    public Employees: User[] = [];
}

/**
 * Address represents a physical address.
 */
export class Address {
    public Street: string[] = [];
    public City: string[] = [];
    public ZipCode: (string | null)[] = [];
}

/**
 * UserProfile represents a user's profile information, including nested address.
 */
export class UserProfile {
    public Name: string[] = [];
    public Age: number[] = [];
    public Address: Address[] = [];
}

/**
 * Employee represents an employee with a profile and skills.
 */
export class Employee {
    public ID: number[] = [];
    public Profile: UserProfile[] = [];
    public Skills: string[] = [];
}
