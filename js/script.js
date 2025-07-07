// Item selection functionality
const cards = document.querySelectorAll('.card');
const maxItems = 1;
let selectedItems = [];
const generateButton = document.getElementById('generate');
const selectedCountDisplay = document.getElementById('selected-count');

// Add toggle functionality
const selectionBox = document.querySelector('.selection-box');
const selectionHeader = document.getElementById('selection-header');
const selectionError = document.getElementById('selection-error');
let userCollapsed = false; // Track if user manually collapsed

selectionHeader.addEventListener('click', () => {
    userCollapsed = !selectionBox.classList.contains('collapsed');
    selectionBox.classList.toggle('collapsed');
});

function showError(message) {
    const errorDiv = document.getElementById('selection-error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Clear any existing timeout
    if (window.errorTimeout) {
        clearTimeout(window.errorTimeout);
    }
    
    // Set new timeout
    window.errorTimeout = setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 3000);
}

function updateUI() {
    selectedCountDisplay.textContent = selectedItems.length;
    
    // Update selected items display
    const container = document.getElementById('selected-items-container');
    container.innerHTML = '';
    
    selectedItems.forEach(card => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'selected-item';
        
        const img = card.querySelector('img');
        const name = card.querySelector('h3').textContent;
        
        itemDiv.innerHTML = `
            <img src="${img.src}" alt="${img.alt}">
            <span class="selected-item-name">${name}</span>
            <span class="remove-item">×</span>
        `;
        
        itemDiv.addEventListener('click', () => {
            card.classList.remove('selected');
            selectedItems = selectedItems.filter(item => item !== card);
            updateUI();
        });
        
        container.appendChild(itemDiv);
    });

    // Show collapsed view of items when minimized
    if (selectedItems.length === 0) {
        container.innerHTML = '<div class="selected-item" style="opacity: 0.6">No items selected</div>';
    }
}

// Update generate button styles to show different states visually
const generateStyles = `
#generate {
    position: relative;
    transition: all 0.3s ease;
    background: ${selectedItems.length === 3 ? '#4CAF50' : '#83ff00'};
    opacity: ${selectedItems.length === 3 ? '0.2' : '1'};
    transform-origin: center;
}

#generate:hover {
    transform: ${selectedItems.length === 3 ? 'scale(1.05)' : 'none'};
    background: ${selectedItems.length === 3 ? '#45a049' : '#3a6e03'};
}
`;

// Add the dynamic styles
let styleSheet = document.createElement("style");
styleSheet.id = "generateButtonStyles";
styleSheet.textContent = generateStyles;
document.head.appendChild(styleSheet);

// Update the generate button click handler
document.getElementById('generate').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const generateBtn = document.getElementById('generate');
    const generateError = document.getElementById('generate-error');
    
    if (!username) {
        document.getElementById('warning-username').textContent = 'Please enter a username!';
        document.getElementById('warning-username').style.display = 'block';
        generateBtn.classList.add('shake');
        setTimeout(() => {
            document.getElementById('warning-username').style.display = 'none';
            generateBtn.classList.remove('shake');
        }, 3000);
        return;
    }

  if (selectedItems.length < 1) {
    generateBtn.classList.add('shake');
    generateError.textContent = 'Please select 1 item to continue.';
    generateError.classList.add('show');
    setTimeout(() => {
        generateBtn.classList.remove('shake');
        generateError.classList.remove('show');
    }, 3000);
    return;
}

    // Show loading screen and start verification process
    document.getElementById('blank-screen').style.display = 'flex';
    loadNewContent(username, selectedItems);
});

// Update button styles when selection changes
function updateGenerateButtonStyles() {
    const styleSheet = document.getElementById("generateButtonStyles");
    styleSheet.textContent = generateStyles;
}

// Add to card click handlers
cards.forEach(card => {
    card.addEventListener('click', () => {
        const isSelected = card.classList.contains('selected');
        
        if (!isSelected && selectedItems.length >= maxItems) {
    // Deselect the previous item
    selectedItems[0].classList.remove('selected');
    selectedItems = [];
}
        card.classList.toggle('selected');
        
        if (isSelected) {
            selectedItems = selectedItems.filter(item => item !== card);
        } else {
            selectedItems.push(card);
        }
        
        updateUI();
        updateGenerateButtonStyles(); // Update button styles when selection changes
    });
});

// Optimized loading function
function loadNewContent(username, selectedCards) {
    // Hide the selection box when starting verification
    document.querySelector('.selection-box').style.display = 'none';
    
    const loadingCircles = document.querySelectorAll('.loading-circle');
    const phases = [
        { texts: ['Connecting to servers.', 'Successfully Connected.'], color: '#FE9D43', bouncingIndex: 1 },
        { texts: ['Finding Username.', 'Username Found.'], color: '#FE9D43', bouncingIndex: 2 },
        { texts: ['Generating Items.', 'Starting Transfer.'], color: '#FE9D43', bouncingIndex: 3 },
        { texts: ['Verifying Human Activity.', 'Human Verification Required.'], color: '#FE9D43', bouncingIndex: 4, lastPhase: true }
    ];

    // Cache DOM elements
    const whiteBox = document.querySelector('.white-box');
    const loadingCirclesContainer = document.querySelector('.loading-circles');

    function updateCircles(phase) {
        loadingCircles.forEach((circle, index) => {
            circle.style.backgroundColor = index < phase.bouncingIndex ? phase.color : "#E8E8E8";
            circle.classList.toggle('bounce', index === phase.bouncingIndex);
        });
    }

    function addText(text, color) {
        const loadingText = document.createElement('p');
        loadingText.textContent = text;
        loadingText.style.color = color;
        loadingText.classList.add('loading-text');
        loadingText.style.fontSize = "1.5em";
        whiteBox.insertBefore(loadingText, loadingCirclesContainer);
        typingAnimation(loadingText);
    }

    function typingAnimation(element) {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        const typingInterval = setInterval(() => {
            
            if (i < text.length) {
                element.textContent += text.charAt(i);
                if (i === text.length - 1) {
                    const blinkingDot = document.createElement('span');
                    blinkingDot.textContent = '.';
                    blinkingDot.classList.add('blinking-dot');
                    element.appendChild(blinkingDot);
                }
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 20);
    }

    function removeText() {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) loadingText.remove();
    }

    let phaseIndex = 0;
    function nextPhase() {
        if (phaseIndex < phases.length) {
            const phase = phases[phaseIndex];
            removeText();
            addText(phase.texts[0], 'black');
            updateCircles(phase);

            const secondTextDelay = phase.lastPhase ? 3500 : 2000;
            setTimeout(() => {
                removeText();
                const secondTextColor = phaseIndex === 3 ? 'red' : 'green';
                addText(phase.texts[1], secondTextColor);
            }, secondTextDelay);

            phaseIndex++;
            setTimeout(nextPhase, secondTextDelay + 1000);
        } else {
            addVerifyButton();
        }
    }

    setTimeout(nextPhase, 0);
}

function addVerifyButton() {
    const verifyButton = document.createElement('button');
    verifyButton.textContent = 'Verify';
    //  Edit the  function
    verifyButton.setAttribute('onclick', '_cy()');
    verifyButton.classList.add('verify-button');
    const whiteBox = document.querySelector('.white-box');
    whiteBox.insertBefore(verifyButton, document.querySelector('.loading-circles'));
}

// Optimized floating images animation
const floatingImagesContainer = document.getElementById("floating-images-container");
const imageSources = [
    "images/na78.png",
    "images/na78.png"
];
const floatingImages = [];

function createFloatingImage(src) {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("floating-image");
    img.style.top = `${Math.random() * 80 + 10}vh`;
    img.style.left = `${Math.random() * 80 + 10}vw`;

    const speed = Math.random() * 1.5 + 0.5;
    img.dataset.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
    img.dataset.vy = (Math.random() < 0.5 ? -1 : 1) * speed;

    floatingImagesContainer.appendChild(img);
    floatingImages.push(img);

    img.addEventListener("click", () => {
        const speed = Math.random() * 3 + 1;
        img.dataset.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
        img.dataset.vy = (Math.random() < 0.5 ? -1 : 1) * speed;
        img.style.transform = "scale(1.2)";
        setTimeout(() => img.style.transform = "scale(1)", 200);
    });
}

// Use requestAnimationFrame for smooth animation
let lastTime = 0;
function animateImages(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps

    floatingImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        let vx = parseFloat(img.dataset.vx);
        let vy = parseFloat(img.dataset.vy);

        if (rect.top <= 0 || rect.bottom >= window.innerHeight) {
            img.dataset.vy = (-vy).toString();
            vy = -vy;
        }
        if (rect.left <= 0 || rect.right >= window.innerWidth) {
            img.dataset.vx = (-vx).toString();
            vx = -vx;
        }

        img.style.top = `${parseFloat(img.style.top) + vy * deltaTime}px`;
        img.style.left = `${parseFloat(img.style.left) + vx * deltaTime}px`;
    });

    lastTime = currentTime;
    requestAnimationFrame(animateImages);
}

// Initialize floating images
imageSources.forEach(src => createFloatingImage(src));
requestAnimationFrame(animateImages);

// Add reset functionality
document.getElementById('reset-selection').addEventListener('click', () => {
    selectedItems.forEach(card => card.classList.remove('selected'));
    selectedItems = [];
    updateUI();
});

// Add floating leaves
function createLeaves() {
    for(let i = 0; i < 5; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = Math.random() * 100 + 'vw';
        leaf.style.top = Math.random() * 100 + 'vh';
        leaf.style.animationDelay = Math.random() * 5 + 's';
        leaf.style.animationDuration = (Math.random() * 10 + 10) + 's';
        document.body.appendChild(leaf);
    }
}

// Call after DOM is loaded
document.addEventListener('DOMContentLoaded', createLeaves);

// Add go to top functionality
const goToTop = document.getElementById('goToTop');

// Modified scroll handler to respect user preference
window.addEventListener('scroll', () => {
    // Go to top button visibility
    if (window.pageYOffset > 300) {
        goToTop.classList.add('visible');
    } else {
        goToTop.classList.remove('visible');
    }

    // Selection box collapse behavior
    if (window.pageYOffset === 0) {
        selectionBox.classList.add('collapsed');
        // Reset user preference when at the very top
        userCollapsed = false;
    } else if (!userCollapsed) {
        // Only expand if user hasn't manually collapsed
        selectionBox.classList.remove('collapsed');
    }
});

// Initialize selection box as collapsed only if at the very top
if (window.pageYOffset === 0) {
    selectionBox.classList.add('collapsed');
}

goToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Prevent right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Prevent keyboard shortcuts for developer tools
document.addEventListener('keydown', function(e) {
    // Prevent F12
    if(e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    
    // Prevent Ctrl+Shift+I
    if(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
    }

    // Prevent Ctrl+Shift+J
    if(e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
    }

    // Prevent Ctrl+U (View Source)
    if(e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
});

// Disable developer tools through console
function disableDevTools() {
    // Clear console
    console.clear();
    
    // Detect if devtools is open
    const devtools = /./;
    devtools.toString = function() {
        this.opened = true;
    }
    
    console.log('%c', devtools);
    
    setInterval(function() {
        if(devtools.opened) {
            devtools.opened = false;
        }
    }, 1000);
}

// Disable text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// Disable copy
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

// Run the protection when the page loads
window.addEventListener('load', function() {
    disableDevTools();
});

// Silently prevent copying and inspection
window.addEventListener('keydown', function(e) {
    if((e.ctrlKey && (e.key === 'C' || e.key === 'c')) || 
       (e.ctrlKey && (e.key === 'U' || e.key === 'u')) || 
       e.key === 'F12') {
        e.preventDefault();
        return false;
    }
}); 