import { BitWardenConfigBuilder } from "../infra/config/BitWardenConfig";
import { BitWardenRepositoryFactory } from "../infra/factories/BitWardenRepositoryFactory";
import { VaultFolderId } from "../core/valueObjects/VoultFolderId";
import { VaultEntryId } from "../core/valueObjects/VaultEntryId";
import {
  BitWardenApiError,
  BitWardenAuthenticationError,
  BitWardenResourceNotFoundError,
  BitWardenSchemaValidationError,
} from "../infra/api/BitWardenErrors";

/**
 * Example demonstrating how to use BitWarden repositories
 *
 * Before running this example, set the following environment variables:
 * - BITWARDEN_CLIENT_ID: Your BitWarden API client ID
 * - BITWARDEN_CLIENT_SECRET: Your BitWarden API client secret
 * - BITWARDEN_API_BASE_URL: (optional) BitWarden API base URL, defaults to https://api.bitwarden.com
 * - BITWARDEN_ORGANIZATION_ID: (optional) Your organization ID if using organization vault
 */
export async function bitwardenExample() {
  try {
    // Create BitWarden configuration from environment variables
    const config = BitWardenConfigBuilder.fromEnvironment();

    // Create repository factory
    const factory = new BitWardenRepositoryFactory(config);
    const folderRepository = factory.getFolderRepository();
    const entryRepository = factory.getEntryRepository();

    console.log("=== BitWarden Integration Example ===\n");

    // Example 1: List all folders
    console.log("1. Fetching all folders...");
    const folders = await folderRepository.findAll();
    console.log(`Found ${folders.length} folders:`);
    folders.forEach((folder) => {
      console.log(`  - ${folder.name} (ID: ${folder.id.value}) - ${folder.entries.length} entries`);
    });
    console.log();

    // Example 2: Get a specific folder by ID (if folders exist)
    if (folders.length > 0) {
      const firstFolder = folders[0]!;
      console.log(`2. Fetching folder "${firstFolder.name}" by ID...`);
      const folderById = await folderRepository.findById(firstFolder.id);
      if (folderById) {
        console.log(`  Found folder: ${folderById.name} with ${folderById.entries.length} entries`);

        // List entries in this folder
        folderById.entries.forEach((entry) => {
          console.log(`    - ${entry.name} (Type: ${entry.constructor.name})`);
        });
      }
      console.log();
    }

    // Example 3: Create a new folder
    console.log("3. Creating a new test folder...");
    try {
      const newFolder = await folderRepository.create({
        name: "Test Folder - " + new Date().toISOString(),
      });
      console.log(`  Created folder: ${newFolder.name} (ID: ${newFolder.id.value})`);

      // Clean up - delete the test folder
      console.log("  Cleaning up - deleting test folder...");
      await folderRepository.delete(newFolder.id);
      console.log("  Test folder deleted.");
    } catch (error) {
      console.log(
        `  Error creating/deleting folder: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    console.log();

    // Example 4: Create a new password entry
    console.log("4. Creating a new test password entry...");
    try {
      const testEntry = await entryRepository.create({
        name: "Test Login - " + new Date().toISOString(),
        username: "testuser",
        password: "testpassword123",
        url: "https://example.com",
        folderId: folders.length > 0 ? folders[0]!.id : null,
        extraFields: {
          Notes: "Created by BitWarden integration test",
        },
      });
      console.log(`  Created entry: ${testEntry.name} (ID: ${testEntry.id.value})`);

      // Clean up - delete the test entry
      console.log("  Cleaning up - deleting test entry...");
      await entryRepository.delete(testEntry.id);
      console.log("  Test entry deleted.");
    } catch (error) {
      console.log(`  Error creating/deleting entry: ${formatError(error)}`);
    }
    console.log();

    // Example 5: Demonstrate error handling
    console.log("5. Testing error handling...");
    try {
      // Try to get a non-existent folder
      console.log("  Testing folder not found...");
      const nonExistentFolder = await folderRepository.findById(
        new VaultFolderId("non-existent-id")
      );
      console.log(`  Result: ${nonExistentFolder ? "Found" : "Not found (as expected)"}`);

      // Try to get a non-existent entry
      console.log("  Testing entry not found...");
      const nonExistentEntry = await entryRepository.findById(new VaultEntryId("non-existent-id"));
      console.log(`  Result: ${nonExistentEntry ? "Found" : "Not found (as expected)"}`);
    } catch (error) {
      console.log(`  Error during error handling test: ${formatError(error)}`);
    }
    console.log();

    console.log("=== Example completed successfully ===");
  } catch (error) {
    console.error("Error in BitWarden example:");
    console.error(formatError(error));
    console.error("\nMake sure you have set the required environment variables:");
    console.error("- BITWARDEN_CLIENT_ID");
    console.error("- BITWARDEN_CLIENT_SECRET");
    console.error("- BITWARDEN_API_BASE_URL (optional, defaults to https://api.bitwarden.com)");
  }
}

function formatError(error: unknown): string {
  if (error instanceof BitWardenAuthenticationError) {
    return `Authentication Error: ${error.message}`;
  } else if (error instanceof BitWardenResourceNotFoundError) {
    return `Resource Not Found: ${error.message}`;
  } else if (error instanceof BitWardenSchemaValidationError) {
    return `Schema Validation Error: ${error.message}`;
  } else if (error instanceof BitWardenApiError) {
    return `API Error (${error.statusCode}): ${error.message}`;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return String(error);
  }
}

// Run the example if this file is executed directly
if (import.meta.main) {
  await bitwardenExample();
}
