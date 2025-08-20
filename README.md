# Summit Health Transfer Center - Genesys Cloud Integration

This project integrates a Summit Health Transfer Center interface with Genesys Cloud for call transfers and agent consultations. It works both as a standalone application and when embedded as an iframe in the Genesys Cloud agent scripts panel.

## GitHub Pages Deployment

This application is deployed using GitHub Pages and can be accessed at:
https://julieclkim.github.io/genscript/

## Setup for Live Interaction (Iframe in Genesys Cloud)

### Prerequisites
- Genesys Cloud organization with admin access
- Client Apps integration set up in Genesys Cloud
- Queue and agent IDs configured in Genesys Cloud

### Configuration Steps for Iframe Integration

1. **Create a Client Application Integration in Genesys Cloud:**
   - Log in to your Genesys Cloud Admin portal
   - Navigate to Admin > Integrations > Client Apps
   - Create a new Custom Client Application with the following settings:
     - Application Type: Widget
     - Application URL: The URL where you host this application
     - Application Name: Summit Health Transfer Center
     - Group Filtering: Select the groups that should have access to this app
     - Communication Type: "Third-party Communication" or "No Communication"

2. **Configure necessary permissions:**
   - Enable the following permissions for your Client App:
     - conversations
     - users

3. **Set up the scripts panel:**
   - Navigate to Admin > Contact Center > Scripts
   - Create a new script or edit an existing one
   - Add an iframe element that points to your hosted application URL
   - Publish the script and assign it to the appropriate queues/flows

4. **Deploy the application:**
   - Host all the files on a web server accessible from Genesys Cloud
   - Ensure the server has HTTPS enabled (required for Genesys Cloud iframe integration)

## Usage in Live Interaction Environment

### Transfer to Queue
1. While on an active call in Genesys Cloud, the agent opens the script containing this iframe
2. Select a queue from the dropdown
3. Click the "Transfer" button
4. The system will use the Genesys Cloud Client Apps SDK to transfer the current call to the queue with ID: 1e2c3f63-10a1-4abb-afdf-960c7d66776e
5. The Genesys Cloud consult interface will open automatically

### Consult with Agent
1. While on an active call in Genesys Cloud, the agent opens the script containing this iframe
2. Select an agent from the dropdown
3. Click the "Consult" button
4. The system will use the Genesys Cloud Client Apps SDK to initiate a consultation with the agent with ID: 6d6ffe7f-407c-4e43-a942-598a4398b3f3
5. The Genesys Cloud consult interface will open automatically

### Provider Lookup
1. Enter an NPI in the input field
2. Click the "ProviderLookup" button
3. The system will look up the provider in Genesys Cloud (simulated in this demo)

## How It Works

When embedded in Genesys Cloud:
- The application detects it's running inside an iframe in Genesys Cloud
- It initializes the Genesys Cloud Client Apps SDK
- It accesses the current interaction directly through the SDK
- When the agent clicks "Transfer" or "Consult," the app uses the SDK to trigger those actions in the agent's interface
- The Genesys consult interface appears automatically as part of the standard workflow

When running standalone (for testing):
- The application falls back to API simulation mode
- All interactions are simulated with appropriate toast notifications

## Important Notes

- This implementation will automatically detect whether it's running in Genesys Cloud or standalone mode
- When embedded in Genesys Cloud, it will use the Client Apps SDK for real interaction handling
- The current call will be captured automatically from the agent's interface
- The Genesys consult interface will open automatically as part of the standard Genesys Cloud workflow

## Genesys Cloud Documentation

For complete API documentation, visit:
- https://developer.genesys.cloud/devapps/api-explorer
- https://developer.genesys.cloud/client-apps/
# genscript
