let promoCount = 0;
let extensionEnabled = true;

// Load initial state from storage
chrome.storage.local.get(['extensionEnabled', 'promoCount'], (result) => {
    if (result.extensionEnabled !== undefined) {
        extensionEnabled = result.extensionEnabled;
    }

    if (result.promoCount !== undefined) {
        promoCount = result.promoCount;
    }
    hidePromotedContent();

});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request) => {
    if (request.extensionEnabled !== undefined) {
        extensionEnabled = request.extensionEnabled;
        if(extensionEnabled) {
            hidePromotedContent();
        }
    } else if (request.resetPromoCount) {
        promoCount = 0;
        chrome.storage.local.set({ promoCount });
        // Clear processed flag so jobs can be re-counted
        const jobs = document.querySelectorAll('[data-view-name="job-card"]');
        jobs.forEach((job) => {
            delete job.dataset.seethroughProcessed;
        });
        // Immediately re-process promos on the page
        hidePromotedContent();
    }
});


const hidePromotedContent = () => {
    if (!extensionEnabled) return;
    
    const jobs = document.querySelectorAll('[data-view-name="job-card"]');
    jobs.forEach((job) => {

        if (job.dataset.seethroughProcessed) {
            return;
        }

        const promos = job.querySelectorAll('span[dir="ltr"]');
        let isPromoted = false;
        promos.forEach((promo) => {
            if (promo.textContent.includes('Promoted')) {
                isPromoted = true;
            }
        });
        if (isPromoted) {
            job.remove();
            promoCount++;
            chrome.storage.local.set({ promoCount });
        }
        job.dataset.seethroughProcessed = 'true'; // Mark job as processed
    });
};

const observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            hidePromotedContent();
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });