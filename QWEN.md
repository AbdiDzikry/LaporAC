# LaporAC - AC Asset Management System

## Project Overview

LaporAC is a comprehensive AC asset management system built for Dharma Group. It's an Angular 21 web application designed to solve several business problems related to air conditioning asset management:

1. **Delayed Damage Reporting**: Staff difficulty in reporting broken AC units due to having to find GA contacts
2. **Irregular Maintenance**: Scheduled services often missed due to manual tracking
3. **Undocumented Costs**: Difficulty tracking maintenance expenses for budgeting
4. **Scattered Asset Data**: AC information (location, serial numbers, history) spread across different Excel files

The solution provides an integrated system with QR code reporting, auto-scheduling, and analytics dashboard.

## Technology Stack

- **Frontend**: Angular 21.1.2
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with ng2-charts wrapper
- **QR Codes**: angularx-qrcode
- **PDF Generation**: jspdf, jspdf-autotable
- **Gantt Charts**: frappe-gantt
- **State Management**: RxJS
- **Testing**: Vitest

## Key Features

### 1. Authentication & Authorization
- Login with email/password
- Role-Based Access Control (RBAC) with four roles:
  - `super_admin`: Full access
  - `admin_ga`: GA Staff (manage assets, validate tickets)
  - `technician`: View & update assigned tickets
  - `dept_head`: Read-only analytics and policy settings

### 2. Asset Management
- CRUD operations for AC units
- QR code generator for physical asset identification
- Bulk import from CSV files
- Advanced filtering and search capabilities
- Asset detail views with maintenance history

### 3. Public Report Form
- No-login required reporting via QR code scanning
- Employee verification via NIK lookup
- Issue categorization (temperature, leakage, noise, etc.)
- Automatic asset information loading

### 4. GA Validation Workflow
- Ticket validation process for quality control
- Status tracking: `pending_validation` → `open` → `assigned` → `in_progress` → `resolved` → `closed`
- False alarm detection and handling

### 5. Executive Dashboard
- KPI cards showing total assets, open tickets, pending validations, and maintenance costs
- Multiple chart types: trend lines, bar charts, pie charts
- Location-based analysis

### 6. Audit Trail System
- Comprehensive logging of all important actions
- User activity tracking with timestamps
- Change history for compliance and transparency

## Project Structure

```
src/app/
├── components/
│   ├── admin-layout/
│   └── toast/
├── core/
├── guards/
│   ├── auth.guard.ts
│   └── role.guard.ts
├── pages/
│   ├── admin/
│   │   ├── analytics/
│   │   ├── assets/
│   │   ├── logs/
│   │   ├── maintenance/
│   │   ├── tickets/
│   │   └── users/
│   ├── auth/
│   ├── dashboard/
│   └── public/
│       └── report-form/
├── services/
│   ├── asset/
│   ├── audit/
│   ├── auth/
│   ├── employee/
│   ├── session/
│   ├── supabase/
│   ├── ticket/
│   └── toast/
└── app.routes.ts
```

## Database Schema

The application uses a Supabase PostgreSQL database with the following key tables:

### `assets` Table
- id (PK)
- sku (unique identifier)
- name, brand, location, pk (capacity)
- status (good, needs_repair, retired)
- purchase_date and maintenance tracking fields

### `tickets` Table
- id (PK)
- asset_id (FK to assets)
- reporter information (NIK, name)
- issue category and description
- status tracking (pending_validation, open, assigned, in_progress, resolved, closed, false_alarm)
- technician assignment and resolution details

### `profiles` Table
- User profile information
- Role-based access control
- Links to Supabase auth system

### `audit_logs` Table
- Comprehensive action logging
- User, action, target, and details tracking
- JSONB for flexible change tracking

### `maintenance_schedules` Table
- Preventive maintenance scheduling
- Link to assets and associated tickets

## Building and Running

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
ng serve

# The application will be available at http://localhost:4200
```

### Production Build
```bash
# Build for production
npm run build
# or
ng build

# The build artifacts will be stored in the dist/ directory
```

### Testing
```bash
# Run unit tests
npm test
# or
ng test

# Run end-to-end tests
ng e2e
```

### Additional Scripts
- `npm run watch`: Watch mode for development builds
- `ng generate component component-name`: Generate new components

## Development Conventions

### Code Structure
- Component-based architecture with clear separation of concerns
- Service layer for data management and business logic
- Guard-based route protection for role-based access
- Lazy-loaded modules for improved performance

### Styling
- Corporate professional design with clean, minimalist aesthetic
- Outline-style UI components with subtle borders
- Consistent color scheme (grayscale with accent colors)
- Responsive design with mobile-first approach

### Security
- Supabase authentication with email/password and magic link support
- Row-Level Security (RLS) for data protection
- Audit trail for all important actions
- Route guards for role-based access control

## Key Configuration Files

- `angular.json`: Build configuration, budgets, and optimization settings
- `proxy.conf.json`: API proxy configuration pointing to https://msa-be.dharmagroup.co.id
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and scripts

## Build Optimization

The project implements several optimizations:
- Lazy loading for admin components to reduce initial bundle size
- Bundle size budgets (1.5MB warning, 2MB error threshold)
- CommonJS dependency allowances for libraries like html2canvas and qrcode
- Code minification and compression
- Tree shaking for unused code elimination

## Special Files and Artifacts

- `PROJECT_RECAP.md`: Comprehensive project documentation covering features, schema, and development status
- `BUILD_OPTIMIZATION_REPORT.md`: Detailed analysis of build optimization strategies
- Various SQL migration files in the migrations directory
- JavaScript utility files for data import and schema management
- CSV files containing AC schedule data