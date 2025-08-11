(function() {
    'use strict';

    if (window.typeToFillInterface) {
        console.log('✅ Type-to-Fill Interface is already loaded.');
        return;
    }


    function createPhiloNoDragModal() {
        // Always allow the modal on attempt/review pages; don't require ddwtos to be present
        const isAttempt = /\/mod\/quiz\/attempt\.php/.test(location.pathname);
        const isReview = /\/mod\/quiz\/review\.php/.test(location.pathname);
        if (!isAttempt && !isReview) {
            const ddwtosQuestions = document.querySelectorAll('.que.ddwtos');
            if (ddwtosQuestions.length === 0) {
                console.log('❌ Not a quiz attempt/review page and no ddwtos found.');
                return;
            }
        }

        // only one modal at a time
        if (document.querySelector('.philo-nodrag-modal')) return;

        let isMinimized = false;
        let interfaceActive = false;
        let typeToFillInstance = null;

        const modal = document.createElement('div');
        modal.className = 'philo-nodrag-modal';
        modal.style.cssText = `
            position: fixed;
            top: 40px;
            right: 40px;
            z-index: 10000;
            background: #fff;
            color: #222;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            min-width: 270px;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 2px solid #4CAF50;
            cursor: move;
            user-select: none;
            overflow: hidden;
            transition: all 0.3s ease;
        `;

        const titleBar = document.createElement('div');
        titleBar.className = 'philo-nodrag-titlebar';
        titleBar.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        `;
        
        const titleText = document.createElement('span');
        titleText.textContent = 'Philo NoDrag - by Reynold';
        titleBar.appendChild(titleText);

        // minimize button
        const minimizeBtn = document.createElement('span');
        minimizeBtn.innerHTML = '−';
        minimizeBtn.style.cssText = `
            cursor: pointer;
            font-size: 18px;
            padding: 0 6px;
            border-radius: 3px;
            transition: background-color 0.2s;
        `;
        minimizeBtn.addEventListener('mouseenter', () => minimizeBtn.style.backgroundColor = 'rgba(255,255,255,0.2)');
        minimizeBtn.addEventListener('mouseleave', () => minimizeBtn.style.backgroundColor = 'transparent');
        
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMinimized = !isMinimized;
            if (isMinimized) {
                content.style.display = 'none';
                modal.style.minWidth = '200px';
                modal.style.maxWidth = '200px';
                minimizeBtn.innerHTML = '+';
            } else {
                content.style.display = 'flex';
                modal.style.minWidth = '270px';
                modal.style.maxWidth = '350px';
                minimizeBtn.innerHTML = '−';
            }
        });
        titleBar.appendChild(minimizeBtn);
        modal.appendChild(titleBar);

        const content = document.createElement('div');
        content.style.cssText = `
            padding: 20px 24px 16px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        `;

        const desc = document.createElement('div');
        desc.textContent = isReview
            ? 'Save answers from this review to auto-fill later'
            : 'Type-to-Fill for Daigler drag-and-drop questions';
        desc.style.cssText = `
            font-size: 14px;
            text-align: center;
            color: #666;
            margin-bottom: 8px;
        `;
        content.appendChild(desc);

        // Container for dynamic controls
        const controls = document.createElement('div');
        controls.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';

        // Type-to-Fill button (attempt pages only; still shown if ddwtos exists)
        if (isAttempt) {
            const enableBtn = document.createElement('button');
            enableBtn.className = 'philo-nodrag-enable-btn';
            enableBtn.innerHTML = '🎯 Enable Type-to-Fill';
            enableBtn.style.cssText = `
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                width: 100%;
            `;
            enableBtn.addEventListener('mouseenter', () => { if (!interfaceActive) enableBtn.style.background = '#45a049'; });
            enableBtn.addEventListener('mouseleave', () => { if (!interfaceActive) enableBtn.style.background = '#4CAF50'; });
            enableBtn.addEventListener('click', () => {
                if (!interfaceActive) {
                    enableBtn.innerHTML = '🔄 Loading...';
                    enableBtn.style.background = '#ff9800';
                    typeToFillInstance = new TypeToFillInterface();
                    window.typeToFillInterface = typeToFillInstance;
                    setTimeout(() => {
                        enableBtn.innerHTML = '✅ Type-to-Fill Active!';
                        enableBtn.style.background = '#28a745';
                        enableBtn.disabled = true;
                        enableBtn.style.cursor = 'not-allowed';
                        interfaceActive = true;
                        const refreshNote = document.createElement('div');
                        refreshNote.style.cssText = `
                            margin-top: 6px;
                            font-size: 12px;
                            color: #666;
                            text-align: center;
                            line-height: 1.4;
                        `;
                        refreshNote.innerHTML = '💡 Refresh the page to return to the original drag interface';
                        controls.appendChild(refreshNote);
                    }, 800);
                }
            });
            controls.appendChild(enableBtn);
        }

        // Save/Fill answers buttons
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = isReview ? '💾 Save Answers from Review' : '⚡ Auto-Fill Saved Answers';
        saveBtn.style.cssText = `
            background: ${isReview ? '#1976d2' : '#9c27b0'};
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            width: 100%;
        `;
        saveBtn.addEventListener('click', async () => {
            try {
                if (isReview) {
                    await PND_saveAnswersFromCurrentPage();
                    PND_toast('✅ Answers saved for this attempt');
                } else {
                    const filled = await PND_autoFillSavedAnswers(true);
                    PND_toast(filled > 0 ? `✅ Auto-filled ${filled} question(s)` : 'ℹ️ No saved answers found');
                }
            } catch (e) {
                console.error(e);
                PND_toast('❌ Failed. Check the console for details.');
            }
        });
        controls.appendChild(saveBtn);

        content.appendChild(controls);
        modal.appendChild(content);

        // Make draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        titleBar.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target === minimizeBtn) return;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === titleBar || titleBar.contains(e.target)) {
                isDragging = true;
                modal.style.cursor = 'grabbing';
            }
        }

        function dragMove(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                modal.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            modal.style.cursor = 'move';
        }

        document.body.appendChild(modal);
        console.log('🎯 Draggable modal created!');
    }

    class TypeToFillInterface {
        constructor() {
            this.questions = new Map();
            this.choices = new Map();
            this.dropZones = new Map();
            this.init();
        }

        init() {
            console.log('🔍 Initializing Type-to-Fill interface...');
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.delayedScan());
            } else {
                this.delayedScan();
            }
        }

        delayedScan() {
            console.log('⏳ Waiting for Moodle to position existing drags...');
            setTimeout(() => {
                console.log('🔍 Starting scan for questions...');
                this.scanForQuestions();
            }, 500);
        }

        scanForQuestions() {
            const ddwtosQuestions = document.querySelectorAll('.que.ddwtos');

            ddwtosQuestions.forEach(questionElement => {
                const questionId = questionElement.id;
                if (this.questions.has(questionId)) return; // Already processed

                this.questions.set(questionId, questionElement);
                this.processQuestion(questionElement, questionId);
            });

            if (ddwtosQuestions.length > 0) {
                this.showSuccessIndicator(`🎯 Enhanced ${ddwtosQuestions.length} questions`);
            }
        }

        processQuestion(questionElement, questionId) {
            const choices = this.extractChoices(questionElement);
            this.choices.set(questionId, choices);

            const dropZones = this.extractDropZones(questionElement);
            this.dropZones.set(questionId, dropZones);

            this.createTypeInterface(questionElement, questionId, choices, dropZones);
        }

        extractChoices(questionElement) {
            const choices = [];

            const dragElements = questionElement.querySelectorAll('.draghome:not(.dragplaceholder)');

            dragElements.forEach(dragElement => {
                const choiceNumber = this.getClassnameNumericSuffix(dragElement, 'choice');
                const groupNumber = this.getClassnameNumericSuffix(dragElement, 'group');
                const text = dragElement.textContent.trim();

                if (choiceNumber && groupNumber && text) {
                    choices.push({
                        choice: choiceNumber,
                        group: groupNumber,
                        text: text,
                        element: dragElement
                    });
                }
            });

            return choices;
        }

        extractDropZones(questionElement) {
            const dropZones = [];

            const dropElements = questionElement.querySelectorAll('.drop');

            dropElements.forEach(dropElement => {
                const placeNumber = this.getClassnameNumericSuffix(dropElement, 'place');
                const groupNumber = this.getClassnameNumericSuffix(dropElement, 'group');

                if (placeNumber && groupNumber) {
                    dropZones.push({
                        place: placeNumber,
                        group: groupNumber,
                        element: dropElement
                    });
                }
            });

            return dropZones;
        }

        createTypeInterface(questionElement, questionId, choices, dropZones) {
            this.hideExistingPlacedElements(questionElement, dropZones);

            dropZones.forEach(dropZone => {
                this.createDropdownForZone(questionElement, questionId, dropZone, choices);
            });

            this.hideOriginalDragElements(questionElement);
        }

        hideExistingPlacedElements(questionElement, dropZones) {
            console.log('🔍 Looking for placed drag elements...');

            const allPlacedDrags = questionElement.querySelectorAll('.draghome.placed');
            console.log(`Found ${allPlacedDrags.length} placed drag elements`);

            allPlacedDrags.forEach((drag, index) => {
                console.log(`Hiding placed drag ${index + 1}: "${drag.textContent.trim()}" with classes: ${drag.className}`);
                drag.style.display = 'none !important';
                drag.style.visibility = 'hidden';
                drag.style.opacity = '0';
                drag.style.position = 'absolute';
                drag.style.left = '-9999px';
            });

            const allDrags = questionElement.querySelectorAll('.draghome:not(.dragplaceholder)');
            console.log(`Checking ${allDrags.length} total drag elements for positioning...`);

            allDrags.forEach((drag, index) => {
                if (drag.style.display === 'none') return;

                const hasInplaceClass = Array.from(drag.classList).some(cls => cls.startsWith('inplace'));

                if (hasInplaceClass) {
                    console.log(`Hiding inplace drag ${index + 1}: "${drag.textContent.trim()}" with classes: ${drag.className}`);
                    drag.style.display = 'none !important';
                    drag.style.visibility = 'hidden';
                    drag.style.opacity = '0';
                    drag.style.position = 'absolute';
                    drag.style.left = '-9999px';
                }
            });

            console.log('✅ Finished hiding placed elements');
        }

        createDropdownForZone(questionElement, questionId, dropZone, choices) {
            const dropElement = dropZone.element;

            // Check if our UI is already there
            if (dropElement.parentNode.querySelector(`.type-to-fill-container[data-place='${dropZone.place}']`)) {
                return;
            }

            const groupChoices = choices.filter(choice => choice.group === dropZone.group);

            if (groupChoices.length === 0) return;

            const container = document.createElement('div');
            container.className = 'type-to-fill-container';
            container.style.cssText = `
                position: relative;
                display: inline-block;
                min-width: 120px;
                margin: 2px;
            `;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'type-to-fill-input';
            input.placeholder = 'Type to search...';
            input.style.cssText = `
                width: 100%;
                padding: 4px 8px;
                border: 2px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
                box-sizing: border-box;
            `;


            const existingChoice = this.getExistingSelection(questionElement, dropZone, groupChoices);
            if (existingChoice) {
                input.value = existingChoice.text;
                input.style.borderColor = '#28a745';
                input.style.backgroundColor = '#f8fff8';
            }

            const dropdown = document.createElement('div');
            dropdown.className = 'type-to-fill-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 4px 4px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;

            groupChoices.forEach(choice => {
                const option = document.createElement('div');
                option.className = 'type-to-fill-option';
                option.textContent = choice.text;
                option.dataset.choice = choice.choice;
                option.dataset.group = choice.group;
                option.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                `;

                option.addEventListener('mouseenter', () => {
                    option.style.backgroundColor = '#f0f0f0';
                });

                option.addEventListener('mouseleave', () => {
                    option.style.backgroundColor = '';
                });

                option.addEventListener('click', () => {
                    this.selectChoice(questionElement, questionId, dropZone, choice, input, dropdown);
                });

                dropdown.appendChild(option);
            });

            this.addInputEventListeners(input, dropdown, questionElement, questionId, dropZone, groupChoices);

            container.appendChild(input);
            container.appendChild(dropdown);

            dropElement.style.display = 'none';
            dropElement.parentNode.insertBefore(container, dropElement);

            container.dataset.questionId = questionId;
            container.dataset.place = dropZone.place;
            container.dataset.group = dropZone.group;
        }

        addInputEventListeners(input, dropdown, questionElement, questionId, dropZone, groupChoices) {
            input.addEventListener('focus', () => {
                this.showDropdown(dropdown, groupChoices, '');
            });

            document.addEventListener('click', (e) => {
                if (!input.parentElement.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });

            input.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.filterDropdown(dropdown, groupChoices, searchTerm);
            });

            input.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e, dropdown, questionElement, questionId, dropZone, groupChoices, input);
            });
        }

        showDropdown(dropdown, choices, searchTerm) {
            dropdown.style.display = 'block';
            this.filterDropdown(dropdown, choices, searchTerm);
        }

        filterDropdown(dropdown, choices, searchTerm) {
            const options = dropdown.querySelectorAll('.type-to-fill-option');
            let visibleCount = 0;

            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                const matches = text.includes(searchTerm);

                option.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });

            // Clear previous single-option highlights
            options.forEach(opt => opt.style.backgroundColor = '');

            if (visibleCount === 1 && searchTerm.length > 0) {
                const visibleOption = dropdown.querySelector('.type-to-fill-option[style*="block"]');
                if (visibleOption) {
                    this.highlightOption(visibleOption);
                }
            } else {
                 // Unhighlight if more than one or no options are visible
                const highlighted = dropdown.querySelector('.type-to-fill-option.highlighted');
                if(highlighted) {
                    this.unhighlightOption(highlighted);
                }
            }
        }

        handleKeyboardNavigation(e, dropdown, questionElement, questionId, dropZone, groupChoices, input) {
            const visibleOptions = Array.from(dropdown.querySelectorAll('.type-to-fill-option')).filter(opt => opt.style.display !== 'none');
            const highlighted = dropdown.querySelector('.type-to-fill-option.highlighted');

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (dropdown.style.display === 'none') {
                        this.showDropdown(dropdown, groupChoices, input.value.toLowerCase());
                    }
                    this.highlightNextOption(visibleOptions, highlighted);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.highlightPreviousOption(visibleOptions, highlighted);
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (highlighted) {
                        highlighted.click();
                    } else if (visibleOptions.length === 1) {
                        visibleOptions[0].click();
                    } else {
                        this.checkExactMatch(input, groupChoices, questionElement, questionId, dropZone, dropdown);
                    }
                    break;

                case 'Escape':
                    dropdown.style.display = 'none';
                    input.blur();
                    break;
            }
        }

        unhighlightOption(option) {
            option.classList.remove('highlighted');
            option.style.backgroundColor = '';
            option.style.color = '';
        }

        highlightOption(option) {
            if (!option) return;
            const dropdown = option.parentNode;
            dropdown.querySelectorAll('.type-to-fill-option').forEach(opt => {
                this.unhighlightOption(opt);
            });

            option.classList.add('highlighted');
            option.style.backgroundColor = '#007bff';
            option.style.color = 'white';
            option.scrollIntoView({ block: 'nearest' });
        }

        highlightNextOption(visibleOptions, currentHighlighted) {
            if (visibleOptions.length === 0) return;

            let nextIndex = 0;
            if (currentHighlighted) {
                const currentIndex = visibleOptions.indexOf(currentHighlighted);
                nextIndex = (currentIndex + 1) % visibleOptions.length;
            }

            this.highlightOption(visibleOptions[nextIndex]);
        }

        highlightPreviousOption(visibleOptions, currentHighlighted) {
            if (visibleOptions.length === 0) return;

            let prevIndex = visibleOptions.length - 1;
            if (currentHighlighted) {
                const currentIndex = visibleOptions.indexOf(currentHighlighted);
                prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleOptions.length - 1;
            }

            this.highlightOption(visibleOptions[prevIndex]);
        }

        selectChoice(questionElement, questionId, dropZone, choice, input, dropdown) {
            input.value = choice.text;
            input.style.borderColor = '#28a745';
            input.style.backgroundColor = '#f8fff8';

            dropdown.style.display = 'none';

            this.updateMoodleState(questionElement, questionId, dropZone, choice);

            setTimeout(() => {
                input.style.borderColor = '#28a745';
            }, 100);

            this.focusNextInput(questionElement, input);
        }

        getExistingSelection(questionElement, dropZone, groupChoices) {
            const placedDrags = dropZone.element.querySelectorAll('.draghome:not(.dragplaceholder)');

            if (placedDrags.length > 0) {
                const placedDrag = placedDrags[0];
                const choiceNumber = this.getClassnameNumericSuffix(placedDrag, 'choice');
                const existingChoice = groupChoices.find(choice => choice.choice == choiceNumber);

                if (existingChoice) {
                    placedDrags.forEach(drag => {
                        drag.style.display = 'none';
                    });
                    return existingChoice;
                }
            }

            const hiddenInput = questionElement.querySelector(`input.placeinput.place${dropZone.place}`);
            if (hiddenInput && hiddenInput.value && hiddenInput.value !== "0") {
                const choiceNumber = hiddenInput.value;
                const existingChoice = groupChoices.find(choice => choice.choice == choiceNumber);
                if (existingChoice) {
                    return existingChoice;
                }
            }

            return null;
        }

        updateMoodleState(questionElement, questionId, dropZone, choice) {
            const hiddenInput = questionElement.querySelector(`input.placeinput.place${dropZone.place}`);

            if (hiddenInput) {
                hiddenInput.value = choice.choice;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        checkExactMatch(input, groupChoices, questionElement, questionId, dropZone, dropdown) {
            const inputValue = input.value.trim().toLowerCase();
            
            const exactMatch = groupChoices.find(choice => 
                choice.text.toLowerCase() === inputValue
            );
            
            if (exactMatch) {
                this.selectChoice(questionElement, questionId, dropZone, exactMatch, input, dropdown);
            } else {
                input.style.borderColor = '#dc3545';
                setTimeout(() => {
                    input.style.borderColor = '#ddd';
                }, 500);
            }
        }

        focusNextInput(questionElement, currentInput) {
            const allInputs = questionElement.querySelectorAll('.type-to-fill-input');
            const inputArray = Array.from(allInputs);
            const currentIndex = inputArray.indexOf(currentInput);
            
            let nextInput = null;
            
            for (let i = currentIndex + 1; i < inputArray.length; i++) {
                if (!inputArray[i].value.trim()) {
                    nextInput = inputArray[i];
                    break;
                }
            }
            
            if (!nextInput) {
                for (let i = 0; i < currentIndex; i++) {
                    if (!inputArray[i].value.trim()) {
                        nextInput = inputArray[i];
                        break;
                    }
                }
            }
            
            if (!nextInput && currentIndex < inputArray.length - 1) {
                nextInput = inputArray[currentIndex + 1];
            }
            
            if (nextInput) {
                setTimeout(() => {
                    nextInput.focus();
                }, 100);
            }
        }

        hideOriginalDragElements(questionElement) {
            const dragArea = questionElement.querySelector('.answercontainer');
            if (dragArea && !dragArea.dataset.toggleAttached) {
                dragArea.style.opacity = '0.3';
                dragArea.style.pointerEvents = 'none';
                dragArea.style.marginTop = '10px';
                dragArea.dataset.toggleAttached = 'true';
                
                const toggleButton = document.createElement('button');
                toggleButton.textContent = 'Show Original Drag Interface';
                toggleButton.type = 'button';
                toggleButton.style.cssText = `
                    margin: 10px 0;
                    padding: 5px 10px;
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                `;
                
                toggleButton.addEventListener('click', () => {
                    const isHidden = dragArea.style.opacity === '0.3';
                    dragArea.style.opacity = isHidden ? '1' : '0.3';
                    dragArea.style.pointerEvents = isHidden ? 'auto' : 'none';
                    toggleButton.textContent = isHidden ? 'Hide Original Drag Interface' : 'Show Original Drag Interface';
                });
                
                dragArea.parentNode.insertBefore(toggleButton, dragArea);
            }
        }

        getClassnameNumericSuffix(element, prefix) {
            const classes = element.className;
            if (!classes) return null;
            
            const classArray = classes.split(' ');
            for (const className of classArray) {
                const regex = new RegExp(`^${prefix}([0-9]+)$`);
                const match = className.match(regex);
                if (match) {
                    return parseInt(match[1]);
                }
            }
            return null;
        }

        showSuccessIndicator(message) {
            // remove existing indicator first
            const existingIndicator = document.getElementById('type-to-fill-success-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            const indicator = document.createElement('div');
            indicator.id = 'type-to-fill-success-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                font-family: Arial, sans-serif;
                font-size: 14px;
                transition: opacity 0.5s ease-in-out;
                opacity: 1;
            `;
            indicator.textContent = message;
            document.body.appendChild(indicator);
            
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 500);
            }, 4000);
        }
    }

    // ---------- Saved answers (review -> attempt) ----------
    function PND_getAttemptId() {
        const params = new URLSearchParams(location.search);
        const attempt = params.get('attempt');
        if (attempt) return attempt;
        // Fallback: try to find attempt param from forms
        const inp = document.querySelector('input[name="attempt"]');
        return inp ? inp.value : null;
    }

    function PND_cssEscape(value) {
        // Minimal CSS escape for attribute selectors
        return value.replace(/([\[\]().:+*?^$|\\])/g, '\\$1');
    }

    function PND_toast(message) {
        const existing = document.getElementById('pnd-toast');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.id = 'pnd-toast';
        el.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 10000;
            background: rgba(0,0,0,0.85); color: #fff; padding: 10px 14px; border-radius: 6px;
            font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        `;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    }

    async function PND_storageLoad() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    chrome.storage.local.get(['PND_savedAnswers','PND_savedTemplates'], data => {
                        resolve({
                            savedAnswers: data.PND_savedAnswers || {},
                            savedTemplates: data.PND_savedTemplates || {}
                        });
                    });
                });
            }
        } catch (_) {}
        try {
            const rawA = localStorage.getItem('PND_savedAnswers');
            const rawT = localStorage.getItem('PND_savedTemplates');
            return { savedAnswers: rawA ? JSON.parse(rawA) : {}, savedTemplates: rawT ? JSON.parse(rawT) : {} };
        } catch (_) { return { savedAnswers: {}, savedTemplates: {} }; }
    }

    async function PND_storageSave(all) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    chrome.storage.local.set({ PND_savedAnswers: all }, () => resolve());
                });
            }
        } catch (_) {}
        try {
            localStorage.setItem('PND_savedAnswers', JSON.stringify(all));
        } catch (_) {}
    }

    async function PND_templateSave(templates) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return new Promise(resolve => {
                    chrome.storage.local.set({ PND_savedTemplates: templates }, () => resolve());
                });
            }
        } catch (_) {}
        try { localStorage.setItem('PND_savedTemplates', JSON.stringify(templates)); } catch (_) {}
    }

    function PND_detectQuestionType(q) {
        const cls = q.className || '';
        if (cls.includes('ddwtos')) return 'ddwtos';
        if (cls.includes('ddmatch')) return 'ddmatch';
        if (cls.includes('ddimageortext')) return 'ddimageortext';
        if (cls.includes('multichoice')) return 'multichoice';
        if (cls.includes('truefalse')) return 'truefalse';
        if (cls.includes('shortanswer')) return 'shortanswer';
        return 'generic';
    }

    function PND_extractFromQuestion(qEl, type) {
        switch (type) {
            case 'ddwtos':
            case 'ddimageortext': {
                const byId = {};
                qEl.querySelectorAll('input.placeinput').forEach(inp => { byId[inp.id] = inp.value; });
                // Fallback for review displays with no inputs: scan placed drags by classes
                const places = {};
                qEl.querySelectorAll('.draghome').forEach(drag => {
                    const cls = drag.className || '';
                    const pm = cls.match(/inplace(\d+)/);
                    const cm = cls.match(/choice(\d+)/);
                    if (pm && cm) places[pm[1]] = cm[1];
                });
                return { placeInputs: byId, places };
            }
            case 'ddmatch': {
                const map = {};
                qEl.querySelectorAll('select').forEach(sel => {
                    if (sel.name) map[sel.name] = sel.value;
                });
                // Fallback: derive by place -> choice from placed drags in review
                const places = {};
                qEl.querySelectorAll('ul.drop').forEach(ul => {
                    const cls = ul.className || '';
                    const m = cls.match(/place(\d+)/);
                    const placeNum = m ? m[1] : null;
                    if (!placeNum) return;
                    const placed = qEl.querySelector(`li.draghome.inplace${placeNum}`) || ul.querySelector('li.draghome');
                    if (placed) {
                        const mc = placed.className.match(/choice(\d+)/);
                        if (mc) places[placeNum] = mc[1];
                    }
                });
                return { selects: map, places };
            }
            case 'multichoice':
            case 'truefalse': {
                const checked = qEl.querySelector('.answer input[type="radio"]:checked');
                if (!checked) return { radios: null };
                return { radios: { name: checked.name, value: checked.value } };
            }
            case 'shortanswer': {
                const inp = qEl.querySelector('input[type="text"]');
                return { text: inp ? { name: inp.name, value: inp.value } : null };
            }
            default: {
                // Generic: capture text inputs and textareas under the question
                const inputs = [];
                qEl.querySelectorAll('input[type="text"], textarea').forEach(el => {
                    if (el.name) inputs.push({ name: el.name, value: el.value, tag: el.tagName.toLowerCase() });
                });
                return { inputs };
            }
        }
    }

    function PND_simpleHash(str) {
        let h = 0; if (!str) return '0';
        for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
        return String(h);
    }

    function PND_getQuestionId(qEl, index) {
        const qid = qEl.getAttribute('data-questionid');
        if (qid) return `qid:${qid}`;
        const id = qEl.id ? `id:${qEl.id}` : null;
        if (id) return id;
        const qtextEl = qEl.querySelector('.qtext');
        const textKey = qtextEl ? qtextEl.textContent.trim().replace(/\s+/g, ' ').slice(0, 500) : qEl.textContent.trim().slice(0, 500);
        return `hash:${PND_simpleHash(textKey)}`;
    }

    function PND_getQuizKey() {
        const heading = document.querySelector('#page-header .page-header-headings h1, h1');
        const title = heading ? heading.textContent.trim() : document.title.trim();
        // normalize path to quiz module root
        const path = location.pathname.replace(/\/(attempt|review)\.php.*/, '/mod/quiz');
        return `${location.origin}${path}::${title}`;
    }

    async function PND_saveAnswersFromCurrentPage() {
        const attemptId = PND_getAttemptId();
        const { savedAnswers, savedTemplates } = await PND_storageLoad();
        if (!attemptId) console.warn('PND: No attempt id; will save to template only');
        if (attemptId && !savedAnswers[attemptId]) savedAnswers[attemptId] = { savedAt: Date.now(), questions: [] };

        const qNodes = Array.from(document.querySelectorAll('.que'));
        const byId = new Map();
        if (attemptId && savedAnswers[attemptId] && Array.isArray(savedAnswers[attemptId].questions)) {
            savedAnswers[attemptId].questions.forEach(q => byId.set(q.key, q));
        }

        qNodes.forEach((qEl, idx) => {
            const key = PND_getQuestionId(qEl, idx);
            const type = PND_detectQuestionType(qEl);
            const data = PND_extractFromQuestion(qEl, type);
            const entry = { key, index: idx, type, data };
            byId.set(key, entry);
        });

        // reassemble in DOM order by current page first, then previous preserved order (double check this later)
        const mergedKeys = new Set(Array.from(byId.keys()));
        const merged = [];
        qNodes.forEach((qEl, idx) => { const key = PND_getQuestionId(qEl, idx); merged.push(byId.get(key)); mergedKeys.delete(key); });
        const prevQuestions = attemptId && savedAnswers[attemptId] && Array.isArray(savedAnswers[attemptId].questions)
            ? savedAnswers[attemptId].questions
            : [];
        prevQuestions.forEach(q => { if (mergedKeys.has(q.key)) merged.push(q); });

        const now = Date.now();
        const quizKey = PND_getQuizKey();
        // save per-attempt (if available)
        if (attemptId) {
            savedAnswers[attemptId] = { savedAt: now, questions: merged };
            await PND_storageSave(savedAnswers);
        }
        // save/update template for this quiz (for reuse across attempts)
        savedTemplates[quizKey] = { savedAt: now, questions: merged };
        await PND_templateSave(savedTemplates);
    }

    function PND_fill_dd_inputs(qEl, map) {
        let filled = 0;
        Object.entries(map).forEach(([id, val]) => {
            const inp = document.getElementById(id);
            if (inp) {
                inp.value = String(val);
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                filled++;
                // if Type-to-Fill UI exists, mirror text for convenience
                const placeMatch = id.match(/place(\d+)/);
                if (placeMatch) {
                    const placeNum = placeMatch[1];
                    const container = qEl.querySelector(`.type-to-fill-container[data-place="${placeNum}"]`);
                    if (container) {
                        const input = container.querySelector('input.type-to-fill-input');
                        const choiceTextEl = qEl.querySelector(`.draghome.choice${val}`);
                        if (input && choiceTextEl) input.value = choiceTextEl.textContent.trim();
                    }
                }
            }
        });
        return filled;
    }

    function PND_fill_dd_places(qEl, places) {
        let filled = 0;
        Object.entries(places).forEach(([placeNum, choiceVal]) => {
            const inp = qEl.querySelector(`input.placeinput.place${placeNum}`);
            if (inp) {
                inp.value = String(choiceVal);
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                filled++;
            }
        });
        return filled;
    }

    function PND_fill_ddmatch(qEl, selects) {
        let filled = 0;
        Object.entries(selects).forEach(([name, value]) => {
            const sel = qEl.querySelector(`select[name="${PND_cssEscape(name)}"]`);
            if (sel) {
                sel.value = String(value);
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                filled++;
            }
        });
        return filled;
    }

    function PND_fill_multichoice(qEl, radios) {
        if (!radios) return 0;
        const el = qEl.querySelector(`.answer input[type="radio"][name="${PND_cssEscape(radios.name)}"][value="${PND_cssEscape(radios.value)}"]`);
        if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return 1;
        }
        return 0;
    }

    function PND_fill_text(qEl, text) {
        if (!text) return 0;
        const el = qEl.querySelector(`input[type="text"][name="${PND_cssEscape(text.name)}"]`);
        if (el) {
            el.value = text.value || '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return 1;
        }
        return 0;
    }

    function PND_fill_generic(qEl, inputs) {
        let filled = 0;
        (inputs || []).forEach(item => {
            const selector = item.tag === 'textarea' ? `textarea[name="${PND_cssEscape(item.name)}"]` : `input[type="text"][name="${PND_cssEscape(item.name)}"]`;
            const el = qEl.querySelector(selector);
            if (el) {
                el.value = item.value || '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                filled++;
            }
        });
        return filled;
    }

    async function PND_autoFillSavedAnswers(stopAtFirstNew) {
        const attemptId = PND_getAttemptId();
        if (!attemptId) return 0;
        const { savedAnswers, savedTemplates } = await PND_storageLoad();
        let saved = savedAnswers[attemptId];
        if (!saved || !saved.questions || saved.questions.length === 0) {
            // fallback to template by quiz key
            const tpl = savedTemplates[PND_getQuizKey()];
            if (!tpl || !tpl.questions) return 0;
            saved = tpl;
        }

        const byKey = new Map(saved.questions.map(q => [q.key, q]));
        const qNodes = Array.from(document.querySelectorAll('.que'));
        let filledCount = 0;
        for (let idx = 0; idx < qNodes.length; idx++) {
            const qEl = qNodes[idx];
            const key = PND_getQuestionId(qEl, idx);
            const entry = byKey.get(key);
            if (!entry) {
                if (stopAtFirstNew) break;
                continue;
            }
            let added = 0;
            switch (entry.type) {
                case 'ddwtos':
                case 'ddimageortext': {
                    const data = entry.data || {};
                    added = PND_fill_dd_inputs(qEl, data.placeInputs || {});
                    if (added === 0 && data.places) {
                        added = PND_fill_dd_places(qEl, data.places);
                    }
                    break;
                }
                case 'ddmatch':
                    added = PND_fill_ddmatch(qEl, (entry.data || {}).selects || {});
                    break;
                case 'multichoice':
                case 'truefalse':
                    added = PND_fill_multichoice(qEl, (entry.data || {}).radios || null);
                    break;
                case 'shortanswer':
                    added = PND_fill_text(qEl, (entry.data || {}).text || null);
                    break;
                default:
                    added = PND_fill_generic(qEl, (entry.data || {}).inputs || []);
            }
            filledCount += added > 0 ? 1 : 0;
            if (!entry || added === 0) {
                if (stopAtFirstNew) break;
            }
        }
        return filledCount;
    }

    // Expose small API on window (debugging/useful for manual triggering)
    window.PND_saveAnswersFromCurrentPage = PND_saveAnswersFromCurrentPage;
    window.PND_autoFillSavedAnswers = PND_autoFillSavedAnswers;

    //auto open
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(createPhiloNoDragModal, 100);
        });
    } else {
        setTimeout(createPhiloNoDragModal, 100);
    }
    
    console.log('🚀 Philo NoDrag loaded! Modal will auto-appear.');

})();