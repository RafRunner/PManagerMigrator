# PManagerMigrate

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A password manager migration tool designed to help users migrate their password vaults from ButterCup password manager (which is being sunsetted) to BitWarden or any compatible vault manager.

## Features

- **ButterCup to BitWarden Migration**: Migrate your password entries, secure notes, credit cards, and folder structure from ButterCup CSV exports to BitWarden
- **Extensible Architecture**: Built with clean architecture principles to easily support additional password managers in the future
- **Safe Migration**: Options to clear target vault or merge with existing entries
- **Folder Structure Preservation**: Maintains your organizational structure during migration
- **Duplicate Detection**: Avoids creating duplicate entries when merging with existing vaults

## Prerequisites

### For ButterCup (Source)

1. Export your ButterCup vault to a CSV file using ButterCup's export functionality

### For BitWarden (Target)

1. Install the [BitWarden CLI](https://bitwarden.com/help/cli/)
2. Login to your BitWarden account via CLI: `bw login`
3. Start the local HTTP API server: `bw serve --hostname localhost --port 8087`
4. Set your BitWarden master password as an environment variable

## Configuration

Copy `.env.template` and rename it to `.env` in the root directory, replacing it with your actual values, or export environment variables like so:

```bash
# Required: Your BitWarden master password
export BITWARDEN_PASSWORD="your_master_password"

# Optional: BitWarden API base URL (defaults to http://localhost:8087)
export BITWARDEN_API_BASE_URL="http://localhost:8087"
```

## Usage

```bash
bun run index.ts <path-to-buttercup-csv-file>
```

Example:

```bash
bun run index.ts ~/Downloads/buttercup-export.csv
```

## Migration Process

1. **Preparation**: Ensure BitWarden CLI is running (`bw serve`)
2. **Export**: Export your ButterCup vault to CSV format
3. **Migration**: Run the tool with your CSV file path
4. **Verification**: Check your BitWarden vault to confirm successful migration

## Architecture

The project uses clean architecture with:

- **Entities**: Core business objects (VaultEntry, VaultFolder, PasswordEntry, etc.)
- **Use Cases**: Business logic (MigrateUseCase)
- **Repositories**: Data access abstractions
- **Infrastructure**: External service implementations (BitWarden API, CSV file handling)

## Supported Entry Types

- **Login Entries**: Username/password combinations
- **Secure Notes**: Text-based notes
- **Credit Cards**: Payment card information
- **Custom Fields**: Additional metadata

## Future Extensions

The architecture supports adding new password managers by implementing:

- New repository factories
- New API clients for target password managers
- New file format parsers for source password managers

## Development

```bash
# Run in development mode with file watching
bun run dev

# Build for production
bun run build

# Lint code
bun run lint

# Format code
bun run format
```

## Requirements

- [Bun](https://bun.sh) runtime (v1.2.16+)
- BitWarden CLI for target migrations
- ButterCup Desktop to export the source vault

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
