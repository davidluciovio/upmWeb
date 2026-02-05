# Project: Unipres System Web - SGAAC (unipres-system-web-sgaac)

## Project Overview

This is an Angular web application for the "Sistema de Gestión y Alertas para el Abasto de Componentes (SGAAC)". Its main purpose is to provide a web interface for managing and monitoring production-related data, likely related to component supply and management to prevent line stoppages.

The application is built with a modern technology stack:

*   **Framework:** Angular
*   **UI Components:** PrimeNG
*   **Styling:** Tailwind CSS, with daisyUI for additional components.
*   **Charts:** ApexCharts for data visualization.
*   **State Management:** Angular Signals and `rxResource` for reactive data streams.

## Architecture

The application follows a modular architecture, with features divided into lazy-loaded modules to optimize performance. Key architectural points include:

*   **Modular Design:** The application is divided into several feature modules such as `Admin`, `Security`, `Home`, `Production Control`, and `Assy Production`. These are loaded on demand.
*   **Authentication:** A JWT-based authentication system is implemented. An `HttpInterceptor` (`auth-interceptor.ts`) automatically attaches the authentication token (stored in `localStorage`) to all outgoing API requests.
*   **Reactive Data Handling:** The project leverages `rxResource` from `@angular/core/rxjs-interop` to manage asynchronous data streams from services. This provides a clean and efficient way to handle loading, error, and data states. Components also use Signals for local state management.
*   **Reusable Components:** There is a strong emphasis on reusability, with shared components like a generic `TableCrud` component (`src/app/shared/components/table-crud/`) used for consistent data management interfaces across different modules.
*   **Performance:** Components primarily use the `ChangeDetectionStrategy.OnPush` strategy to minimize unnecessary re-renders and improve UI performance.
*   **API Interaction:** Services encapsulate all HTTP communication with the backend API. The base URL for the API is configured in the `src/environments/` files.

## Building and Running the Project

### Development Server

To run the application locally for development:

```bash
npm start
```

or

```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

### Production Build

To build the application for production:

```bash
npm run build
```

or

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

To execute unit tests:

```bash
npm test
```

or

```bash
ng test
```

## Development Conventions

*   **State Management:** Use Angular Signals for component-level state and `rxResource` when fetching and managing data from services.
*   **API Calls:** All interactions with the backend API should be handled within a dedicated service.
*   **Styling:** Use Tailwind CSS utility classes for styling. For more complex, reusable UI elements, consider creating components with PrimeNG or daisyUI.
*   **Forms:** Use `ReactiveFormsModule` for building forms to ensure type safety and scalability.
*   **Asynchronous Data:** When a component needs to display data from an API, use the `rxResource` pattern as seen in `area-managment.ts`. This provides a consistent way to handle loading states and reloading data.
    *   The `rxResource` API returns an object (e.g., `Users$`) where data and loading states are accessed via methods: `Users$.value()` and `Users$.isLoading()`. The data stream can be refreshed using `Users$.reload()`.
