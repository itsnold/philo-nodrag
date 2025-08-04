
# Philo NoDrag

*by Reynold Angelo C. Segundo*


This is an extension that fixes the super annoying drag-and-drop design in Daigler (Hi philo). Instead of dragging stuff around, you just type to find and pick your answer. (Seryoso, bakit ganun yung design?)


## What It Does

This is for those Daigler "drag and drop into text" (ddwtos) questions. Instead of dragging, you just type and pick.


## Demo


[Demo](https://drive.google.com/file/d/1bMA_3e9RT_wSRbySjCAC4DTgDiPUtX2C/view?usp=sharing)



## Installation

1. Download the latest release zip from the [GitHub Releases page](https://github.com/itsnold/philo-nodrag/releases)
2. Extract the zip file
3. Open Chrome and go to `chrome://extensions/`
4. Turn on "Developer mode"
5. Click "Load unpacked" and pick this folder
5. Go to any Daigler drag-and-drop question
6. A green modal will automatically appear in the top-right corner
7. Click "🎯 Enable Type-to-Fill" to activate the interface


## How It Works

Honestly, Daigler's drag-and-drop is a pain. This extension doesn't necessarily remove it, but just hides the draggy stuff and puts a search box instead while still syncing the inputs so your answer still gets saved.

#### How it works in the background
1. Loads the modal
2. Waits half a second for Daigler to load (So we're sure your device rendered the saved input already)
3. Looks for all the drag-and-drop questions on the page
4. Grabs all the possible answers and the drop spots
5. Hides the old draggy UI (pero hindi binubura, just in case)
6. Shows a new input box where you can type and pick your answer

#### How it finds and copies data

```javascript
// Target Daigler's drag-and-drop questions
const ddwtosQuestions = document.querySelectorAll('.que.ddwtos');

// Kunin lahat ng draggable choices
const dragElements = questionElement.querySelectorAll('.draghome:not(.dragplaceholder)');

// Kunin lahat ng drop zones
const dropElements = questionElement.querySelectorAll('.drop');
```



It just reads the classes Daigler uses, like `choice1`, `group1`, `place1`, etc.

#### Sync pa rin sa Daigler

It doesn't mess with Daigler's answers. It just writes your pick into the hidden input that Daigler already uses, so your answer still gets saved the normal way.

```javascript
// Update the hidden input na binabasa ni Daigler
const hiddenInput = questionElement.querySelector(`input.placeinput.place${dropZone.place}`);
hiddenInput.value = choice.choice;
hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
```

#### If you had an answer before


If you already answered before or refreshed, it checks if you already put something there and shows it.

```javascript
// Check kung may placed na visually
const placedDrags = dropZone.element.querySelectorAll('.draghome:not(.dragplaceholder)');

// Check hidden input values
const hiddenInput = questionElement.querySelector(`input.placeinput.place${dropZone.place}`);
```

### How it injects

#### Content Scripts Auto-Injection

The extension now uses content scripts for automatic loading:

```json
"content_scripts": [
  {
    "matches": [
      "*://*/mod/quiz/attempt.php*",
      "*://*/mod/quiz/review.php*",
      "*://*/question/type/ddwtos/*"
    ],
    "js": ["moodle.js"],
    "run_at": "document_idle"
  }
]
```

#### Background Script Fallback

```javascript
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.url && (details.url.includes('/mod/quiz/attempt.php') ||
                      details.url.includes('/mod/quiz/review.php'))) {
    // Inject natin yung script
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ['moodle.js'],
      world: 'MAIN' // Para makalusot sa CSP
    });
  }
});
```

The background script is still there as backup for dynamic page loads.

#### CSP Bypass



It uses a (`world: 'MAIN'`) so it can actually run correctly and not get blocked by Google's CSP

### UI Enhancement

#### Search and Filtering

```javascript
filterDropdown(dropdown, choices, searchTerm) {
    const options = dropdown.querySelectorAll('.type-to-fill-option');
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        const matches = text.includes(searchTerm);
        option.style.display = matches ? 'block' : 'none';
    });
}
```

#### Keyboard Navigation



You can use your keyboard for everything:
- Arrow keys to move up/down
- Enter to pick
- Escape to close
- Enter to jump to the next **empty** box
- Tab to jump to the next box

#### Visual Feedback

- Green border means you picked something
- Red flash means mali yung input mo
- After you pick, it jumps to the next box

### Compatibility and Safety

#### Non-Destructive Approach



It doesn't delete or break anything. You can still use the old drag-and-drop if you want (pero bakit mo pa gagawin yun?)

#### Graceful Degradation



If the extension fails or you turn it off, Daigler works like normal. Walang mawawala sa sagot mo.

#### Memory Management

```javascript
// Para di mag-double load
if (window.typeToFillInterface) {
    console.log('✅ Type-to-Fill Interface is already loaded.');
    return;
}
```



It also makes sure it doesn't load twice or mess up your page.


## How to Use

1. Go to any Daigler quiz page (PHILO) with drag-and-drop questions
2. The green modal will automatically appear in the top-right corner
3. Click "🎯 Enable Type-to-Fill" to activate the interface
4. Type in any drop zone to search for answers
5. Use arrow keys and Enter to pick
6. To go back to original drag-and-drop, just refresh the page (F5) (Again, bakit mo pa gagawin yun?)


## Troubleshooting

- Not seeing the modal? Make sure you're on a page with drag-and-drop questions and try refreshing
- Button not working? Try refreshing the page
- Missing options? The interface waits a bit for Daigler to load everything first


## Notes

- Only works for Daigler's `ddwtos` (drag and drop into text) questions
- Needs Chrome Manifest V3
- Doesn't break the original Daigler stuff

---


*Ginawa ko 'to para di na tayo mahirapan sa Ateneo philosophy assessments. No more tiis sa bad UI decisions. Enjoy!* 