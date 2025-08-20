/**
 * Genesys Cloud Client Apps SDK Integration
 * For use when embedded in the Genesys Cloud interface
 */

// Track SDK initialization status
let sdkInitialized = false;

// Store current interaction info
let currentInteraction = null;
let currentConversationId = null;
let currentParticipantId = null;

/**
 * Initialize the Genesys Cloud Client Apps SDK when the application loads
 */
function initializeGenesysSDK() {
    if (typeof window.parentIFrame !== 'undefined') {
        console.log("Application is in iframe, initializing Genesys SDK");
        
        // Initialize the Client Apps SDK
        const initializationOptions = {
            customizationOptions: {
                notificationOptions: {
                    displayToastNotifications: true
                }
            }
        };

        // Load the Client Apps SDK
        const platformClient = window.require('platformClient');
        const client = platformClient.ApiClient.instance;
        const clientApp = client.setEnvironmentFromHost(window.location.origin);
        
        // Initialize the Client Apps SDK and handle current conversation
        clientApp.alerting.configureAlerting();
        clientApp.lifecycle.bootstrapped().then(() => {
            console.log("Genesys Cloud Client Apps SDK initialized");
            sdkInitialized = true;

            // Get the current interaction
            clientApp.alerting.getAlertingInteractions()
                .then(alertingInteractions => {
                    if (alertingInteractions && alertingInteractions.length > 0) {
                        currentInteraction = alertingInteractions[0];
                        currentConversationId = currentInteraction.id;
                        currentParticipantId = currentInteraction.participantId;
                        console.log("Current interaction loaded", currentInteraction);
                    } else {
                        console.log("No active interactions found");
                    }
                })
                .catch(error => {
                    console.error("Error getting current interaction", error);
                });

            // Subscribe to future interactions
            clientApp.alerting.onInteraction(interactionEvent => {
                currentInteraction = interactionEvent;
                currentConversationId = interactionEvent.id;
                currentParticipantId = interactionEvent.participantId;
                console.log("Interaction updated", currentInteraction);
            });

            // Notify that the app is ready
            console.log("Client App fully initialized");
        }).catch(error => {
            console.error("Error bootstrapping Genesys Cloud Client Apps SDK", error);
        });
    } else {
        console.log("Application is not in iframe, running in standalone mode");
    }
}

/**
 * Transfer the current call to a specific queue using the Client Apps SDK
 * @param {string} queueId - The ID of the queue to transfer to
 * @param {string} queueName - The name of the queue (for UI display only)
 */
function transferToQueueViaSDK(queueId, queueName) {
    return new Promise((resolve, reject) => {
        if (!sdkInitialized) {
            console.log("SDK not initialized, falling back to API simulation");
            // Fall back to API simulation if not in Genesys Cloud iframe
            window.setTimeout(() => {
                resolve({
                    status: "success",
                    message: `Simulated transfer to ${queueName}`,
                    queueId: queueId
                });
            }, 1000);
            return;
        }

        if (!currentConversationId) {
            reject({
                status: "error",
                message: "No active conversation to transfer"
            });
            return;
        }

        console.log(`Transferring conversation ${currentConversationId} to queue ${queueId}`);

        // Get SDK instances
        const platformClient = window.require('platformClient');
        const conversationsApi = new platformClient.ConversationsApi();

        // Prepare transfer request
        const transferRequest = {
            transferTargetType: "QUEUE",
            transferTargetId: queueId
        };

        // Initiate the transfer
        conversationsApi.postConversationsCallParticipantReplace(
            currentConversationId, 
            currentParticipantId, 
            transferRequest
        )
        .then(() => {
            resolve({
                status: "success",
                message: `Successfully transferred to ${queueName}`,
                queueId: queueId
            });
        })
        .catch(error => {
            console.error("Error transferring conversation", error);
            reject({
                status: "error",
                message: `Transfer failed: ${error.message || "Unknown error"}`,
                error: error
            });
        });
    });
}

/**
 * Consult with a specific agent using the Client Apps SDK
 * @param {string} agentId - The ID of the agent to consult with
 * @param {string} agentName - The name of the agent (for UI display only)
 */
function consultWithAgentViaSDK(agentId, agentName) {
    return new Promise((resolve, reject) => {
        if (!sdkInitialized) {
            console.log("SDK not initialized, falling back to API simulation");
            // Fall back to API simulation if not in Genesys Cloud iframe
            window.setTimeout(() => {
                resolve({
                    status: "success",
                    message: `Simulated consult with ${agentName}`,
                    agentId: agentId
                });
            }, 1000);
            return;
        }

        if (!currentConversationId) {
            reject({
                status: "error",
                message: "No active conversation to consult on"
            });
            return;
        }

        console.log(`Consulting with agent ${agentId} for conversation ${currentConversationId}`);

        // Get SDK instances
        const platformClient = window.require('platformClient');
        const conversationsApi = new platformClient.ConversationsApi();

        // Prepare consult request
        const consultRequest = {
            speakTo: "BOTH", // Agent can speak to both the customer and the consulted agent
            consultTargetType: "USER",
            consultTargetId: agentId
        };

        // Initiate the consult
        conversationsApi.postConversationsCallParticipantConsult(
            currentConversationId, 
            currentParticipantId, 
            consultRequest
        )
        .then(() => {
            resolve({
                status: "success",
                message: `Successfully initiated consultation with ${agentName}`,
                agentId: agentId
            });
        })
        .catch(error => {
            console.error("Error initiating consultation", error);
            reject({
                status: "error",
                message: `Consultation failed: ${error.message || "Unknown error"}`,
                error: error
            });
        });
    });
}

/**
 * Check if the application is running inside a Genesys Cloud iframe
 */
function isInGenesysCloud() {
    return sdkInitialized;
}

// Export functions for use in our main script.js file
window.genesysSDK = {
    initialize: initializeGenesysSDK,
    transferToQueue: transferToQueueViaSDK,
    consultWithAgent: consultWithAgentViaSDK,
    isInGenesysCloud: isInGenesysCloud
};
