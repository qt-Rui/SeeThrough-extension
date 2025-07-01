const promosBlocked = document.querySelector('.promosBlocked');
const toggleSwitch = document.getElementById('extensionToggle');
const toggleLabel = document.querySelector('.toggle-label');
const resetButton = document.querySelector('.reset-button');

resetButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {resetPromoCount: true});
    });
});

// Initialize the toggle state
chrome.storage.local.get(['promoCount', 'extensionEnabled'], (result) => {
    const promoCount = result.promoCount || 0;
    const isEnabled = result.extensionEnabled !== undefined ? result.extensionEnabled : true;
    
    updateDisplay(promoCount);
    toggleSwitch.checked = isEnabled;
    updateToggleLabel(isEnabled);
});

// Listen for toggle changes
toggleSwitch.addEventListener('change', function() {
    const isEnabled = this.checked;
    chrome.storage.local.set({ extensionEnabled: isEnabled });
    updateToggleLabel(isEnabled);
    
    // Send message to content script to update its state
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {extensionEnabled: isEnabled});
    });
});

function updateDisplay(promoCount) {
    promosBlocked.textContent = `Promos blocked: ${promoCount}`;
}

function updateToggleLabel(isEnabled) {
    toggleLabel.textContent = `SeeThrough is ${isEnabled ? 'ON' : 'OFF'}`;
    toggleLabel.style.color = isEnabled ? '#5a6a85' : '#8a99b3';
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.promoCount) {
            updateDisplay(changes.promoCount.newValue);
        }
        if (changes.extensionEnabled) {
            toggleSwitch.checked = changes.extensionEnabled.newValue;
            updateToggleLabel(changes.extensionEnabled.newValue);
        }
    }
});