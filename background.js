// auto-inject on navigation to quiz pages
chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.url && (details.url.includes('/mod/quiz/attempt.php') || details.url.includes('/mod/quiz/review.php') || details.url.includes('/question/type/ddwtos/'))) {
    console.log('Quiz page detected. Auto-injecting script.');
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ['moodle.js'],
      world: 'MAIN'
    }).then(() => {
      console.log('Script auto-injected successfully.');
    }).catch(err => {
      console.error('Failed to auto-inject script:', err);
    });
  }
}, { url: [{ schemes: ['http', 'https'] }] });

// listen for clicks on the extension icon (fallback)
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.includes('/mod/quiz/attempt.php') || tab.url.includes('/mod/quiz/review.php') || tab.url.includes('/question/type/ddwtos/'))) {
    console.log('Manual injection triggered by user.');
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['moodle.js'],
      world: 'MAIN'
    }).then(() => {
      console.log('Script manually injected successfully.');
    }).catch(err => {
      console.error('Failed to manually inject script:', err);
    });
  } else {
    // show notification if not on a valid page (don't know how you'd get here but ok)
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showNotValidPageMessage,
      world: 'MAIN'
    });
  }
});

// show notification when not on valid page
function showNotValidPageMessage() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  notification.textContent = 'Philo NoDrag only works on Daigler quiz pages bro';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}