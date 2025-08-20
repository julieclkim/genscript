// Summit Health Transfer Center - Interactivity

// Initialize Genesys integration when document is ready
let genesysAuthenticated = false;
let inGenesysCloud = false;

$(document).ready(function() {
    // Add middle-card class to Provider Information card
    $('.col-12.mb-3.d-flex.justify-content-center .card').addClass('middle-card');
    
    // Initialize Genesys Cloud SDK (if running in iframe)
    window.genesysSDK.initialize();
    
    // Check if we're running in Genesys Cloud after a short delay
    setTimeout(() => {
        inGenesysCloud = window.genesysSDK.isInGenesysCloud();
        if (inGenesysCloud) {
            console.log("Running inside Genesys Cloud - using SDK for interactions");
            showToast("Connected to Genesys Cloud", "success");
            genesysAuthenticated = true;
        } else {
            console.log("Running in standalone mode - using API simulation");
            // Authenticate with Genesys Cloud API in standalone mode
            window.genesysApi.authenticate()
                .then(token => {
                    genesysAuthenticated = true;
                    console.log("Genesys Cloud authentication successful");
                })
                .catch(error => {
                    console.error("Genesys Cloud authentication failed", error);
                    showToast("Genesys Cloud authentication failed. Using simulation mode.", "warning");
                });
        }
    }, 1000);
    
    // Category button selection
    $('.category-btn').on('click', function() {
        // Toggle selection
        $(this).toggleClass('selected');
        
        // Update the diagnosis text based on selected categories
        updateDiagnosisText();
    });

    // Select Neuro category by default (as shown in the mockup)
    $('[data-category="Neuro"]').addClass('selected');
    
    // Provider Referral Form button
    $('#providerReferralFormBtn').on('click', function() {
        showToast('Provider Referral Form would open here');
    });
    
    // Transfer button - Integrated with Genesys Cloud
    $('#transferBtn').on('click', function() {
        const selectedQueue = $('#queueList').val();
        if (selectedQueue && selectedQueue !== 'Queue List ▼') {
            // Show loading state
            const $btn = $(this);
            const originalText = $btn.text();
            $btn.prop('disabled', true).text('Transferring...');
            
            // Get the actual queue ID - in this demo we're using a fixed ID provided
            const queueId = "1e2c3f63-10a1-4abb-afdf-960c7d66776e"; // Fixed queue ID
            
            // Use SDK if in Genesys Cloud, otherwise use API
            const transferFunction = inGenesysCloud ? 
                window.genesysSDK.transferToQueue : 
                window.genesysApi.transferToQueue;
            
            // Execute the transfer
            transferFunction(queueId, selectedQueue)
                .then(response => {
                    showToast('Successfully transferred to ' + selectedQueue + ' queue', 'success');
                    console.log('Transfer response:', response);
                })
                .catch(error => {
                    showToast('Transfer failed: ' + (error.message || 'Unknown error'), 'error');
                    console.error('Transfer error:', error);
                })
                .finally(() => {
                    // Restore button state
                    $btn.prop('disabled', false).text(originalText);
                });
        } else {
            showToast('Please select a queue first', 'warning');
        }
    });
    
    // Consult button - Integrated with Genesys Cloud
    $('#consultBtn').on('click', function() {
        const selectedAgent = $('#agentList').val();
        if (selectedAgent && selectedAgent !== 'Agent List ▼') {
            // Show loading state
            const $btn = $(this);
            const originalText = $btn.text();
            $btn.prop('disabled', true).text('Consulting...');
            
            // Get the actual agent ID - in this demo we're using a fixed ID provided
            const agentId = "6d6ffe7f-407c-4e43-a942-598a4398b3f3"; // Fixed agent ID
            
            // Use SDK if in Genesys Cloud, otherwise use API
            const consultFunction = inGenesysCloud ? 
                window.genesysSDK.consultWithAgent : 
                window.genesysApi.consultWithAgent;
            
            // Execute the consult
            consultFunction(agentId, selectedAgent)
                .then(response => {
                    showToast('Successfully initiated consultation with ' + selectedAgent, 'success');
                    console.log('Consult response:', response);
                })
                .catch(error => {
                    showToast('Consultation failed: ' + (error.message || 'Unknown error'), 'error');
                    console.error('Consultation error:', error);
                })
                .finally(() => {
                    // Restore button state
                    $btn.prop('disabled', false).text(originalText);
                });
        } else {
            showToast('Please select an agent first', 'warning');
        }
    });
    
    // Provider Lookup button - Integrated with Genesys API
    $('#providerLookupBtn').on('click', function() {
        const npiValue = $('#npiInput').val().trim();
        if (npiValue) {
            // Show loading state
            const $btn = $(this);
            const originalText = $btn.text();
            $btn.prop('disabled', true).text('Looking up...');
            
            // Call Genesys Cloud API to look up provider
            window.genesysApi.lookupProvider(npiValue)
                .then(response => {
                    showToast('Provider found: ' + response.providerInfo.name);
                    console.log('Provider lookup response:', response);
                })
                .catch(error => {
                    showToast('Provider lookup failed: ' + (error.message || 'Unknown error'));
                    console.error('Provider lookup error:', error);
                })
                .finally(() => {
                    // Restore button state
                    $btn.prop('disabled', false).text(originalText);
                });
        } else {
            showToast('Please enter an NPI value');
        }
    });
    
    // Epic buttons
    $('#openEpicChartBtn').on('click', function() {
        showToast('Opening Epic Chart for Samuel Jackson');
    });
    
    $('#openEpicTransferOrderBtn').on('click', function() {
        showToast('Opening Epic Transfer Order for Samuel Jackson');
    });
    
    // Provider TX Consult buttons
    $('#addParticipantBtn').on('click', function() {
        showModal('Add Participant', 
            `<div class="mb-3">
                <label for="participantName" class="form-label">Participant Name</label>
                <input type="text" class="form-control" id="participantName">
            </div>
            <div class="mb-3">
                <label for="participantRole" class="form-label">Role</label>
                <select class="form-select" id="participantRole">
                    <option>Physician</option>
                    <option>Nurse</option>
                    <option>Administrator</option>
                    <option>Other</option>
                </select>
            </div>`
        );
    });
    
    $('#leaveBridgeBtn').on('click', function() {
        showToast('Left the bridge - call has ended');
    });
    
    $('#viewRecordingBtn').on('click', function() {
        showToast('Opening recording/transcript interface');
    });
    
    $('#copySummaryBtn').on('click', function() {
        showToast('Summary copied to Epic');
    });
    
    // Initial setup
    updateDiagnosisText();
    
    // Create toast container if it doesn't exist
    if ($('#toastContainer').length === 0) {
        $('body').append('<div id="toastContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>');
    }
    
    // Create modal container if it doesn't exist
    if ($('#modalContainer').length === 0) {
        $('body').append(`
            <div class="modal fade" id="interactionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="modalSubmitBtn">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
});

// Helper function to update diagnosis text based on selected categories
function updateDiagnosisText() {
    const selectedCategories = [];
    $('.category-btn.selected').each(function() {
        selectedCategories.push($(this).data('category'));
    });
    
    let diagnosisText = 'Partially complex seizures';
    
    if (selectedCategories.length > 0) {
        diagnosisText += ' - ' + selectedCategories.join(', ');
    }
    
    $('#diagnosisText').text(diagnosisText);
}

// Helper function to show toast messages
function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    
    // Set background color based on type
    let bgClass = 'bg-info text-white';
    if (type === 'success') bgClass = 'bg-success text-white';
    if (type === 'warning') bgClass = 'bg-warning text-dark';
    if (type === 'error') bgClass = 'bg-danger text-white';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    $('#toastContainer').append(toastHtml);
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), { 
        autohide: true,
        delay: 3000
    });
    toastElement.show();
}

// Helper function to show modal dialogs
function showModal(title, bodyContent) {
    $('#interactionModal .modal-title').text(title);
    $('#interactionModal .modal-body').html(bodyContent);
    
    $('#modalSubmitBtn').off('click').on('click', function() {
        // Handle form submission based on modal type
        if (title === 'Add Participant') {
            const name = $('#participantName').val();
            const role = $('#participantRole').val();
            
            if (name) {
                showToast(`Added ${name} (${role}) to the consultation`);
                const modal = bootstrap.Modal.getInstance(document.getElementById('interactionModal'));
                modal.hide();
            } else {
                showToast('Please enter a name for the participant');
            }
        }
    });
    
    const modal = new bootstrap.Modal(document.getElementById('interactionModal'));
    modal.show();
}
