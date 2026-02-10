# LaporAC - AC Asset Management System

This is an enhanced version of the LaporAC application with significant improvements to make it more robust, maintainable, and feature-rich.

## Improvements Made

### 1. Authentication & Session Management
- **AuthService**: Centralized authentication service with proper login/logout functionality
- **SessionService**: Session state management with role-based access control
- Improved security with proper session handling

### 2. Error Handling
- **ErrorHandlerService**: Centralized error handling with user-friendly messages
- Consistent error handling across all services
- Better error reporting and logging

### 3. Loading States
- **LoadingService**: Centralized loading state management
- Improved UX with loading indicators

### 4. Notifications
- **NotificationService**: Advanced notification system with different types
- Integration with toast notifications
- Business event notifications

### 5. Data Export
- **DataExportService**: CSV and PDF export functionality for assets and tickets
- Maintenance reporting capabilities

### 6. Maintenance Management
- **MaintenanceService**: Enhanced preventive maintenance scheduling
- Automated schedule generation
- Bulk maintenance operations

### 7. Code Quality Improvements
- Added proper error handling to all services
- Implemented loading states
- Added audit logging to all operations
- Improved type safety
- Better separation of concerns

## Architecture

The application follows a modular architecture with clearly defined services:

- `auth/` - Authentication and user management
- `session/` - Session state management
- `asset/` - Asset management functionality
- `ticket/` - Ticket management functionality
- `maintenance/` - Preventive maintenance scheduling
- `employee/` - Employee verification
- `audit/` - Audit logging
- `error-handler/` - Error handling
- `loading/` - Loading state management
- `notification/` - Notification system
- `data-export/` - Data export functionality
- `toast/` - Toast notifications
- `supabase/` - Supabase client configuration

## Features

### Core Features
- Asset management with QR code generation
- Ticket management for repairs
- Role-based access control
- Audit trail system
- Employee verification via NIK

### Enhanced Features
- Advanced reporting (CSV/PDF exports)
- Preventive maintenance scheduling
- Real-time notifications
- Improved error handling
- Loading state management
- Automated maintenance scheduling

### User Roles
- **Super Admin**: Full access to all features
- **Admin**: Manage assets, validate tickets, manage users
- **Technician**: View and update assigned tickets
- **Department Head**: View analytics and reports
- **Staff**: Create reports via public form

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `src/environments/environment.ts`
4. Run the application:
   ```bash
   npm start
   ```

### Environment Configuration
Update `src/environments/environment.ts` with your Supabase credentials:

```typescript
export const environment = {
    production: false,
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseKey: 'YOUR_SUPABASE_KEY'
};
```

## Database Schema

The application uses a Supabase PostgreSQL database with the following key tables:

### `assets` Table
- Asset tracking with maintenance intervals
- Financial lifecycle tracking
- Status and location management

### `tickets` Table
- Issue tracking with status workflow
- Assignment and verification tracking
- Resolution notes and costs

### `maintenance_schedules` Table
- Preventive maintenance scheduling
- Link to assets and tickets
- Completion tracking

### `profiles` Table
- User role management
- Profile information

### `audit_logs` Table
- Comprehensive action logging
- User and action tracking

## API Integration

The application integrates with external employee verification API using NIK (Employee ID) to verify reporters.

## Security

- Supabase authentication with email/password
- Row-Level Security (RLS) for data protection
- Audit trail for all important actions
- Role-based access control

## Deployment

The application can be deployed as a standard Angular application. For production, ensure:

1. Environment variables are properly configured
2. SSL is enabled for security
3. Proper backup procedures are in place
4. Monitoring is set up for the application

## Development

### Running Locally
```bash
npm start
```

### Building for Production
```bash
npm run build
```

### Testing
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or raise an issue in the repository.