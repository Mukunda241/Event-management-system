// Cancel Confirmation Modal Utility
// Creates a beautiful custom confirmation dialog without emojis

function showCancelConfirmation(eventName, onConfirm) {
    // Create modal HTML
    const modalHTML = `
        <div class="cancel-confirmation-modal" id="cancelConfirmModal">
            <div class="cancel-modal-content">
                <div class="cancel-modal-header">
                    <div class="cancel-modal-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <h3>Cancel Booking Confirmation</h3>
                </div>
                <div class="cancel-modal-body">
                    <p>Are you sure you want to cancel your booking for <strong>"${eventName}"</strong>?</p>
                    
                    <div class="cancel-warning-list">
                        <div class="cancel-warning-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <span>Your ticket will be cancelled</span>
                        </div>
                        <div class="cancel-warning-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <span>50 points will be deducted</span>
                        </div>
                        <div class="cancel-warning-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                            <span>Events attended count will decrease</span>
                        </div>
                    </div>
                </div>
                <div class="cancel-modal-footer">
                    <button class="cancel-modal-btn cancel-btn-cancel" id="cancelModalNo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5"></path>
                        </svg>
                        Keep Booking
                    </button>
                    <button class="cancel-modal-btn cancel-btn-confirm" id="cancelModalYes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Yes, Cancel It
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('cancelConfirmModal');
    if (existing) {
        existing.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('cancelConfirmModal');
    const btnYes = document.getElementById('cancelModalYes');
    const btnNo = document.getElementById('cancelModalNo');
    
    // Show modal
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Handle confirmation
    btnYes.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onConfirm) onConfirm();
    };
    
    // Handle cancellation
    btnNo.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    };
    
    // Close on ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}
