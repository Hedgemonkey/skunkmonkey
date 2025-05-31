/**
 * Asset Health Check
 * Tests asset loading functionality and displays results
 */

/**
 * Test if a file can be loaded
 * @param {string} url - The URL to test
 * @param {string} testId - The test identifier
 */
async function testFile(url, testId) {
    const statusElement = document.getElementById(`status-${testId}`);
    const resultElement = document.getElementById(`result-${testId}`);
    const containerElement = document.getElementById(`test-container-${testId}`);

    try {
        const start = performance.now();

        // For JS files, try to import dynamically
        if (url.endsWith('.js')) {
            try {
                await import(url);
                const end = performance.now();
                statusElement.textContent = '✅ Success';
                statusElement.className = 'badge bg-success';
                resultElement.innerHTML = `
                    <div class="text-success">
                        <strong>✅ Script loaded successfully</strong><br>
                        Load time: ${(end - start).toFixed(2)}ms<br>
                        URL: <code>${url}</code>
                    </div>
                `;
                containerElement.className = 'alert alert-success';
            } catch (importError) {
                console.error('Import error:', importError);
                throw new Error(`Script import failed: ${importError.message}`);
            }
        }
        // For CSS files, create a link element and test loading
        else if (url.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;

            const loadPromise = new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = reject;
                setTimeout(() => reject(new Error('CSS load timeout')), 10000);
            });

            document.head.appendChild(link);
            await loadPromise;

            const end = performance.now();
            statusElement.textContent = '✅ Success';
            statusElement.className = 'badge bg-success';
            resultElement.innerHTML = `
                <div class="text-success">
                    <strong>✅ Stylesheet loaded successfully</strong><br>
                    Load time: ${(end - start).toFixed(2)}ms<br>
                    URL: <code>${url}</code>
                </div>
            `;
            containerElement.className = 'alert alert-success';

            // Remove the test link
            document.head.removeChild(link);
        }
        // For other files, use fetch
        else {
            const response = await fetch(url, { method: 'HEAD' });
            const end = performance.now();

            if (response.ok) {
                statusElement.textContent = '✅ Success';
                statusElement.className = 'badge bg-success';
                resultElement.innerHTML = `
                    <div class="text-success">
                        <strong>✅ File accessible</strong><br>
                        Status: ${response.status} ${response.statusText}<br>
                        Load time: ${(end - start).toFixed(2)}ms<br>
                        URL: <code>${url}</code>
                    </div>
                `;
                containerElement.className = 'alert alert-success';
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error(`Test failed for ${url}:`, error);
        statusElement.textContent = '❌ Failed';
        statusElement.className = 'badge bg-danger';
        resultElement.innerHTML = `
            <div class="text-danger">
                <strong>❌ Test failed</strong><br>
                Error: ${error.message}<br>
                URL: <code>${url}</code>
            </div>
        `;
        containerElement.className = 'alert alert-danger';
    }
}

/**
 * Initialize asset health testing
 */
function initAssetHealthCheck() {
    // Find all test buttons and attach event listeners
    const testButtons = document.querySelectorAll('[data-test-url]');

    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-test-url');
            const testId = this.getAttribute('data-test-id');

            if (url && testId) {
                // Reset status
                const statusElement = document.getElementById(`status-${testId}`);
                const resultElement = document.getElementById(`result-${testId}`);
                const containerElement = document.getElementById(`test-container-${testId}`);

                statusElement.textContent = '⏳ Testing...';
                statusElement.className = 'badge bg-warning';
                resultElement.innerHTML = '<div class="text-muted">Testing asset...</div>';
                containerElement.className = 'alert alert-info';

                // Run the test
                testFile(url, testId);
            }
        });
    });

    // Auto-run tests if specified
    const autoTestButtons = document.querySelectorAll('[data-auto-test="true"]');
    autoTestButtons.forEach(button => {
        // Delay auto-tests slightly to let the page settle
        setTimeout(() => button.click(), 500);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAssetHealthCheck);
