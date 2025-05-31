/**
 * Staff Sidebar Toggle
 * Handles mobile sidebar toggle functionality for staff interface
 */

/**
 * Initialize sidebar toggle functionality
 */
function initStaffSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (!sidebarToggle) {
        return;
    }

    sidebarToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.staff-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initStaffSidebar);
