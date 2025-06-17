# RFC: BitWarden API Integration

## Summary

Implement BitWarden repository implementations (`BitWardenVaultFolderRepository` and `BitWardenVaultEntryRepository`) that integrate with the Bitwarden Vault Management API to provide the same interface as the existing CSV-based repositories.

## Background

The current system supports reading from CSV exports (BCup format) through `CsvBCupVaultFolderRepository` and `CsvBCupVaultEntryRepository`. We need to add support for directly interfacing with BitWarden's API to enable real-time vault management.

## Detailed Design

### API Client

- Create a `BitWardenApiClient` class to handle HTTP communications with BitWarden API
- Handle authentication (API key or OAuth-based)
- Provide methods for folders and entries CRUD operations
- Handle rate limiting and error responses

### Repository Implementations

#### BitWardenVaultFolderRepository

- Implement `VaultFolderRepository` interface
- Map BitWarden folder API responses to `VaultFolder` entities
- Handle folder hierarchy (parent-child relationships)
- Filter out Trash folders (similar to CSV implementation)

#### BitWardenVaultEntryRepository

- Implement `VaultEntryRepository` interface
- Map BitWarden item API responses to appropriate `VaultEntry` subtypes:
  - `PasswordEntry` for login items
  - `CreditCardEntry` for card items
  - `NoteEntry` for secure note items
- Handle custom fields mapping to `extraFields`

### Configuration

- Add BitWarden API configuration (base URL, API key, organization ID)
- Support both self-hosted and cloud BitWarden instances

### Dependencies

- Add HTTP client dependency (e.g., `undici` or `axios`)
- Add configuration management for API credentials

### Error Handling

- Map BitWarden API errors to domain-appropriate exceptions
- Handle network failures gracefully
- Implement retry logic for transient failures

## Implementation Plan

1. Add HTTP client dependency
2. Create BitWarden API client with authentication
3. Implement BitWardenVaultFolderRepository
4. Implement BitWardenVaultEntryRepository
5. Add configuration management
6. Add comprehensive error handling

## Security Considerations

- API keys should be stored securely (environment variables)
- Implement proper authentication token refresh if using OAuth
- Validate API responses to prevent injection attacks
- Use HTTPS only for API communications

## Testing Strategy

- Unit tests with mocked API responses
- Integration tests against BitWarden test instance
- Error scenario testing (network failures, invalid credentials, etc.)
