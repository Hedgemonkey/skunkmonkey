/**
 * Entry point for profile dashboard page
 * For use with django-vite
 */

// Mark this file as having side effects (prevents tree-shaking)
// @vite-ignore
import.meta.glob('./profile_dashboard.js', { eager: true });

// Import base profile styles (shared across all profile pages)
import '../../css/profile.css';

// Create a dashboard controller
class ProfileDashboardController {
  constructor() {
    console.log('Profile dashboard controller initialized');
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Profile dashboard initialized');
      // Any dashboard-specific JS can be added here
    });
  }
}

// Create an instance to ensure the code runs
const dashboardController = new ProfileDashboardController();

// Export the controller for possible use by other modules
export default dashboardController;
