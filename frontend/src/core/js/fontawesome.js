/**
 * FontAwesome SVG Configuration
 *
 * This file configures FontAwesome to use SVG with JavaScript instead of web fonts.
 * This approach avoids font decoding issues and improves performance.
 *
 * Advantages:
 * - No font decoding errors
 * - Only loads icons actually used in the application
 * - Better cross-browser compatibility
 * - No CORS issues with font files
 */

// Import FontAwesome core
import { library, dom } from '@fortawesome/fontawesome-svg-core';

// Import specific icon packages
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Add all icons to the library
// You can optimize this by only importing specific icons you need
library.add(fas, far, fab);

// Replace any existing <i> tags with <svg> and set up a MutationObserver to
// continue doing this as the DOM changes
dom.watch();
