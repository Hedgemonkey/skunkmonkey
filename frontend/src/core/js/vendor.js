/**
 * Explicit vendor file
 *
 * This file explicitly imports vendor libraries to ensure they are properly
 * chunked during the build process.
 */

// Import FontAwesome
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/free-regular-svg-icons';
import '@fortawesome/free-brands-svg-icons';

// Import Chart.js
import 'chart.js';

// Import Bootstrap
import 'bootstrap';

// Import other vendor libraries used in the project
import 'jquery';
import 'popper.js';
import 'select2';
import 'sweetalert2';

// This file doesn't need to export anything
// Its purpose is to ensure these modules are included in the build
export default {
  loaded: true
};
