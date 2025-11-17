# Persian CRM Web Application - Project Outline

## File Structure
```
/mnt/okcomputer/output/
├── index.html              # Home dashboard with economic summary
├── customers.html          # Customer management interface
├── sales.html              # Sales tracking and forms
├── accounts.html           # Financial accounts and transactions
├── reminders.html          # Reminder system with notifications
├── dashboard.html          # Analytics and performance dashboard
├── main.js                 # Main application logic and utilities
├── service-worker.js       # Service Worker for notifications
├── sample-data.json        # Sample data for demonstration
├── resources/              # Static assets directory
│   ├── hero-bg.jpg        # Hero background image
│   ├── pattern-bg.svg     # Geometric pattern background
│   └── user-avatar.jpg    # Default user avatar
├── interaction.md          # Interaction design documentation
├── design.md              # Design system documentation
└── outline.md             # This project outline
```

## Page Breakdown

### 1. index.html - Home Dashboard
**Purpose**: Main landing page with economic overview and quick access
**Key Sections**:
- Fixed header with search, date/time, and navigation
- Economic summary cards (gold, USD, stock market)
- Interactive market trend charts
- Quick action buttons
- Floating navigation menu

**Interactive Components**:
- Live market data fetching with cache fallback
- Animated economic indicators
- Search functionality with autocomplete
- Jalali date/time display with real-time updates

### 2. customers.html - Customer Management
**Purpose**: Comprehensive customer relationship management
**Key Sections**:
- Customer list with card/table view toggle
- Advanced filtering and sorting
- Customer detail modal with full information
- Quick action buttons (call, email, reminder)

**Interactive Components**:
- Customer form with Jalali date picker
- Customer cards with expandable details
- Tag-based filtering system
- Contact action integration

### 3. sales.html - Sales Tracking
**Purpose**: Sales recording and performance tracking
**Key Sections**:
- Sales entry form with customer autocomplete
- Sales history table with filters
- Financial calculations display
- Receipt generation interface

**Interactive Components**:
- Dynamic form calculations
- Product selection with pricing
- Sales analytics charts
- Export functionality

### 4. accounts.html - Financial Management
**Purpose**: Income/expense tracking and financial analysis
**Key Sections**:
- Transaction entry form
- Balance dashboard
- Financial charts and analytics
- Budget tracking interface

**Interactive Components**:
- Real-time balance calculations
- Chart visualizations with ECharts
- Budget monitoring with alerts
- Financial report generation

### 5. reminders.html - Reminder System
**Purpose**: Task management and notification scheduling
**Key Sections**:
- Reminder list with status filters
- Reminder creation form
- Calendar view with Jalali dates
- Notification management

**Interactive Components**:
- Jalali calendar integration
- Service Worker notifications
- Reminder scheduling system
- Status tracking interface

### 6. dashboard.html - Analytics Dashboard
**Purpose**: Business intelligence and performance metrics
**Key Sections**:
- Customizable widget layout
- KPI cards and metrics
- Interactive charts and graphs
- Performance analysis tools

**Interactive Components**:
- Drag-and-drop widget customization
- Real-time data updates
- Chart drill-down functionality
- Comparative analysis tools

## Core JavaScript Modules (main.js)

### 1. Persian Date Utilities
- Jalali calendar conversion using jalaali-js
- Iran timezone handling (Asia/Tehran)
- Persian number formatting
- Date display localization

### 2. Storage Management
- IndexedDB integration with Dexie.js
- Local storage fallback
- Data synchronization
- Export/import functionality

### 3. UI Components
- Modal management
- Form validation
- Chart initialization
- Animation controllers

### 4. Notification System
- Service Worker integration
- Web Push API implementation
- Permission management
- Fallback notification methods

### 5. Market Data Integration
- API fetching with caching
- Real-time updates
- Fallback data sources
- Data visualization

## Service Worker (service-worker.js)

### Core Functionality
- Offline data caching
- Push notification handling
- Background sync
- Resource optimization

### Notification Features
- Reminder alerts
- System updates
- Data sync notifications
- Custom notification templates

## Design Implementation

### CSS Architecture
- Tailwind CSS base framework
- Custom Persian font integration
- Royal theme color variables
- RTL layout support
- Responsive design patterns

### Animation Library Integration
- Anime.js for smooth animations
- Typed.js for text effects
- ECharts.js for data visualization
- p5.js for background effects

### Persian Localization
- Vazir and IranSans fonts
- RTL text direction
- Jalali calendar support
- Persian number formatting
- Cultural UI patterns

## Data Models

### Customer Model
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "email": "string",
  "tags": ["string"],
  "createdAt": "jalali-date",
  "notes": [{"id": "string", "text": "string", "createdAt": "jalali-date"}]
}
```

### Sales Model
```json
{
  "id": "string",
  "customerId": "string",
  "items": [{"productId": "string", "qty": "number", "unitPrice": "number"}],
  "total": "number",
  "tax": "number",
  "discount": "number",
  "date": "jalali-date",
  "status": "string"
}
```

### Transaction Model
```json
{
  "id": "string",
  "type": "income|expense",
  "title": "string",
  "amount": "number",
  "category": "string",
  "date": "jalali-date",
  "description": "string",
  "status": "paid|pending"
}
```

### Reminder Model
```json
{
  "id": "string",
  "customerId": "string",
  "type": "call|meeting|task",
  "title": "string",
  "when": "jalali-datetime",
  "status": "active|completed|canceled",
  "notes": "string"
}
```

## Technical Requirements

### Browser Support
- Modern browsers with ES6+ support
- Service Worker compatibility
- IndexedDB support
- Persian font rendering

### Performance Targets
- First Contentful Paint < 2s
- Largest Contentful Paint < 3s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

### Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Persian screen reader support

## Development Phases

### Phase 1: Core Infrastructure
1. Set up basic HTML structure
2. Implement Persian date utilities
3. Create storage layer
4. Build navigation system

### Phase 2: UI Components
1. Design system implementation
2. Form components
3. Modal system
4. Chart integration

### Phase 3: Business Logic
1. Customer management
2. Sales tracking
3. Financial calculations
4. Reminder system

### Phase 4: Advanced Features
1. Notification system
2. Data export/import
3. Advanced analytics
4. Performance optimization

### Phase 5: Polish & Testing
1. Cross-browser testing
2. Accessibility audit
3. Performance optimization
4. User experience refinement