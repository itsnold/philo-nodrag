(function() {
    'use strict';

    if (window.typeToFillInterface) {
        console.log('✅ Type-to-Fill Interface is already loaded.');
        return;
    }


    function createPhiloNoDragModal() {
        const ddwtosQuestions = document.querySelectorAll('.que.ddwtos');
        if (ddwtosQuestions.length === 0) {
            console.log('❌ No drag-and-drop questions found on this page.');
            return;
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
        desc.textContent = 'Type-to-Fill for Daigler drag-and-drop questions';
        desc.style.cssText = `
            font-size: 14px;
            text-align: center;
            color: #666;
            margin-bottom: 8px;
        `;
        content.appendChild(desc);

        // enable button (no disable option - just refresh to restore)
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

        enableBtn.addEventListener('mouseenter', () => {
            if (!interfaceActive) enableBtn.style.background = '#45a049';
        });
        enableBtn.addEventListener('mouseleave', () => {
            if (!interfaceActive) enableBtn.style.background = '#4CAF50';
        });

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
                    
                    // add refresh instruction
                    const refreshNote = document.createElement('div');
                    refreshNote.style.cssText = `
                        margin-top: 10px;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                        line-height: 1.4;
                    `;
                    refreshNote.innerHTML = '💡 Refresh the page to return to original drag interface';
                    content.appendChild(refreshNote);
                }, 1000);
            }
        });
        content.appendChild(enableBtn);
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
