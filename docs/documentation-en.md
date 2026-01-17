# QA Validation Documentation: Easy Maintenance (Beta MVP)

This document outlines the validation strategy, test cases, and core flows for the **Easy Maintenance** mini SaaS. It is intended for the external QA team to ensure system stability, security, and data consistency during the beta phase.

## 1. System Overview

**Easy Maintenance** is a mini SaaS designed to simplify the management of equipment and infrastructure maintenance.

- **The Problem It Solves**: Helps companies keep track of recurring maintenance tasks, ensuring compliance with regulations and preventing operational failures due to overlooked maintenance.
- **Organization (Company)**: The top-level entity representing a client. All data (users, items, maintenances) belongs to an organization.
- **Users**: Employees or contractors linked to a specific Organization.
- **Regulatory Items**: Maintenance items governed by external laws or norms (e.g., fire extinguishers, elevators). They require a linked **Norm**.
- **Operational Items**: Maintenance items defined by the company's internal policies (e.g., HVAC cleaning, office painting). They use **Custom Periodicity**.

---

## 2. Environments

| Environment       | Component              | URL / Access                                                                   |
|:------------------|:-----------------------|:-------------------------------------------------------------------------------|
| **Homologation**  | Front-end (Next.js)    | `https://easy-maintenance-web-production.up.railway.app/login`                 |
| **Homologation**  | Back-end (Spring Boot) | `https://easy-maintenance-api-production.up.railway.app`                       |
| **Documentation** | Swagger / OpenAPI      | `https://easy-maintenance-api-production.up.railway.app/swagger-ui/index.html` |

---

## 3. Access Profiles

### Bootstrap Admin
- **Access**: Via `/private/admin/login`
- **Authentication**: Uses a static token passed in the `X-Admin-Token` header (`BOOTSTRAP_ADMIN_TOKEN`).
- **Responsibilities**:
    - Creating and managing Organizations.
    - Creating the first users for an organization.
    - Global system configuration.

### Regular User
- **Access**: Standard login at `/login`.
- **Authentication**: Email and password.
- **Scope**: Access limited to the organization they belong to.
- **First Access**: Must change their password upon first login (`firstAccess: true` flag in login response).

---

## 4. Initial Setup Flow (Admin)

1. **Access Admin Panel**: Navigate to the private administrative area.
2. **Authenticate**: Provide the `BOOTSTRAP_ADMIN_TOKEN` (stored in local storage as `adminToken` in the current web implementation).
3. **Create Organization**:
    - Provide Name (e.g., "ACME Corp").
    - Select a Plan (FREE, PRO, etc.).
    - System generates a unique `Organization Code`.
4. **Create User**:
    - Link user to the created `Organization Code`.
    - Set Name, Email, Role (ADMIN/USER), and Initial Password.
    - Set Status to `ACTIVE`.
5. **Handover**: Provide the credentials to the organization's initial user.
6. **First Login**: User logs in with the initial password and is forced to set a new one.

---

## 5. Authentication Flow

- **Login**: POST to `/auth/login` with `email` and `password`.
- **JWT Generation**: On success, the backend returns an `accessToken`.
- **Storage**: The token is stored in `localStorage` (if "Remember Me" is checked) or `sessionStorage`.
- **Headers**: 
    - `Authorization: Bearer <token>` for all authenticated requests.
    - `X-Org-Id` (or `organizationCode`) to identify the context.

### Expected Behavior
- **Invalid Credentials**: Returns `401 Unauthorized`.
- **Inactive Users**: Login should be blocked (Expected `403 Forbidden`).
- **Missing Org**: Requests should fail if the user/token isn't correctly mapped to an organization.

---

## 6. Features to Be Tested (Scope)

### Authentication
- Successful login with valid credentials.
- Error handling for invalid email or password.
- **First Access Flow**: Redirection to `/auth/change-password` and mandatory password update.
- Accessing protected routes without a token (Redirect to login).
- Behavior when the token is expired (Session termination).

### Organizations (Admin)
- Creation of organizations with valid/invalid data.
- Validation of required fields (Name, Plan).
- Listing of existing organizations.
- Security check: Ensure organizations cannot be created without the admin token.

### Users (Admin)
- Creation of users linked to specific organizations.
- Verification of user status (ACTIVE vs. INACTIVE).
- Enforcement of the "change password on first access" rule.

### Norms
- Listing available norms.
- Validating the content of the norm (Item Type, Periodicity, Authority).

### Items
- **REGULATORY**:
    - Must have a linked Norm.
    - Periodicity is inherited from the Norm.
- **OPERATIONAL**:
    - Must have custom periodicity (Quantity + Unit).
- Validation of required fields (Item Type, Category, Location).

---

## 7. Test Cases

| Test ID     | Description             | Preconditions             | Steps                                                                                    | Expected Result                          |
|:------------|:------------------------|:--------------------------|:-----------------------------------------------------------------------------------------|:-----------------------------------------|
| **AUTH-01** | Valid Login             | User exists and is ACTIVE | 1. Enter valid email/pass<br>2. Click Login                                              | Redirect to Dashboard; Token stored.     |
| **AUTH-02** | First Access Flow       | New user created by Admin | 1. Login with temp password<br>2. Redirected to change password<br>3. Enter new password | Password updated; Force new login.       |
| **AUTH-03** | Invalid Credentials     | None                      | 1. Enter wrong password<br>2. Click Login                                                | Show "E-mail ou senha inválidos."        |
| **ORG-01**  | Create Organization     | Admin Token valid         | 1. Fill Name & Plan<br>2. Submit                                                         | Organization created; Success message.   |
| **ORG-02**  | Admin Security          | No Admin Token            | 1. Attempt POST to admin endpoint                                                        | Return `401` or `403`.                   |
| **ITEM-01** | Create Regulatory Item  | Norms exist               | 1. Select REGULATORY<br>2. Select Norm<br>3. Fill fields & Save                          | Item created; Inherits norm periodicity. |
| **ITEM-02** | Create Operational Item | None                      | 1. Select OPERATIONAL<br>2. Set Custom Period<br>3. Save                                 | Item created with custom period.         |
| **ITEM-03** | Validation Error        | Missing fields            | 1. Leave "Item Type" empty<br>2. Submit                                                  | Show "Informe o tipo do item." (400)     |
| **SEC-01**  | Unauthorized Access     | No JWT                    | 1. Access `/maintenances` directly                                                       | Redirect to `/login`.                    |

---

## 8. Suggested Test Data

| Category             | Example Data                                                         |
|:---------------------|:---------------------------------------------------------------------|
| **Organization**     | Name: `Hospital Central`, Plan: `PRO`, City: `São Paulo`             |
| **Admin User**       | Email: `admin@hospital.com`, Name: `Admin User`, Role: `ADMIN`       |
| **Regular User**     | Email: `tech@hospital.com`, Name: `Maintenance Tech`, Role: `USER`   |
| **Regulatory Item**  | Type: `EXTINTOR PQS`, Category: `REGULATORY`, Norm: `NR-23`          |
| **Operational Item** | Type: `AR CONDICIONADO`, Category: `OPERATIONAL`, Period: `6 Months` |

---

## 9. Known Limitations (Beta)

- **No Email Sending**: Password changes and notifications do not trigger emails yet.
- **No Password Recovery**: If a user forgets their password, an admin must reset it manually.
- **No Billing**: All features are currently free; payment gateway is not integrated.
- **Active Development**: UI components and API endpoints may change frequently.

---

## 10. Final QA Checklist

- [ ] Admin can create a new organization.
- [ ] Admin can create a user linked to that organization.
- [ ] User can log in and is forced to change password on first access.
- [ ] User can view norms.
- [ ] User can create a Regulatory Item (with Norm).
- [ ] User can create an Operational Item (with Custom Period).
- [ ] All mandatory field validations show appropriate error messages.
- [ ] Unauthorized access to private routes is blocked.
- [ ] Data is consistent across different pages (e.g., Item shows correct Norm data).

---

**Generated by Junie - Senior QA Lead**
**Date: 2026-01-15**