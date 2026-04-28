const NEW_SET_FORM_ELEMENT = document.getElementById('new-set-form');
const NEW_SET_NAME_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-name');
const NEW_SET_PASSWORD_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-password');
const NEW_SET_SUBMIT_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-submit');
const NEW_SET_ERROR_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-error');

const SET_PASSWORD_FORM_ELEMENT = document.getElementById('set-password-form');
const SET_PASSWORD_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password');
const SET_PASSWORD_SUBMIT_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password-submit');
const SET_PASSWORD_ERROR_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password-error');

const ENTRY_LIST_HEADER_TEXT_ELEMENT = document.getElementById('entry-list-header-text');
const ENTRY_LIST_ELEMENT = document.getElementById('entry-list');

const NEW_ENTRY_BUTTON_ELEMENT = document.getElementById('new-entry-add');

const ENTRY_ELEMENT_TEMPLATE = document.getElementById('entry-element-template');
const ENTRY_ELEMENT_INEDIT_TEMPLATE = document.getElementById('entry-element-inedit-template');

let currentSet = null;
let entryInEditIndex = -1;

class PasswordEntry {

    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

class PasswordSet {

    constructor(name, key) {
        this.name = name;
        this.key = key;
        this.entries = [];
    }

    fillEntryElement(index, entry) {
        let entryElement = ENTRY_LIST_ELEMENT.children[index];

        let entryNameElement = entryElement.querySelector('.entry-name');
        entryNameElement.textContent = entry.username;

        let entryPasswordElement = entryElement.querySelector('.entry-password');
        entryPasswordElement.textContent = entry.password;
    }

    fillEntryInEditElement(index, entry) {
        let entryElement = ENTRY_LIST_ELEMENT.children[index];

        let entryNameElement = entryElement.querySelector('.entry-name');
        entryNameElement.placeholder = entry.username;

        let entryPasswordElement = entryElement.querySelector('.entry-password');
        entryPasswordElement.placeholder = entry.password;

        let entrySaveElement = entryElement.querySelector('.entry-save-button');
        entrySaveElement.addEventListener('click', onEntryInEditSaved);
    }

    buildEntryElement(index) {
        let entry = this.entries[index];
        ENTRY_LIST_ELEMENT.innerHTML += ENTRY_ELEMENT_TEMPLATE.innerHTML;

        this.fillEntryElement(index, entry);
    }

    buildEntryInEditElement(index) {
        let entry = this.entries[index];
        ENTRY_LIST_ELEMENT.innerHTML += ENTRY_ELEMENT_INEDIT_TEMPLATE.innerHTML;

        this.fillEntryInEditElement(index, entry);
    }

    addEntry() {

        this.entries.push(new PasswordEntry('', ''));
    }
}

function setCurrentSet(passwordSet) {

    if (currentSet == null) {
        SET_PASSWORD_ELEMENT.disabled = false;
        SET_PASSWORD_SUBMIT_ELEMENT.disabled = false;

        SET_PASSWORD_SUBMIT_ELEMENT.addEventListener('click', onSetPasswortSubmitted);
    }

    ENTRY_LIST_HEADER_TEXT_ELEMENT.textContent = 'Set \"' + passwordSet.name + '\" - Alle Einträge:';
    currentSet = passwordSet;
}

function printText(element, text) {
    element.textContent = text;
    element.hidden = false;
}

function loadEntries() {

    for (let i = 0; i < currentSet.entries.length; i++) {

        currentSet.buildEntry(i);
    }

    NEW_ENTRY_BUTTON_ELEMENT.disabled = false;

    NEW_ENTRY_BUTTON_ELEMENT.addEventListener('click', onNewEntryCreated);
}

function onEntryInEditSaved() {
    ENTRY_LIST_ELEMENT.children[entryInEditIndex].innerHTML = ENTRY_ELEMENT_TEMPLATE.innerHTML;

    currentSet.fillEntryElement(entryInEditIndex, currentSet.entries[entryInEditIndex]);
    entryInEditIndex = -1;
}

function onSetPasswortSubmitted() {
    let enteredKey = SET_PASSWORD_ELEMENT.value;

    if (enteredKey === "") {
        printText(SET_PASSWORD_ERROR_ELEMENT, 'Bitte geben Sie ein Masterkennwort an.');
        return;
    }

    if (enteredKey !== currentSet.key) {
        printText(SET_PASSWORD_ERROR_ELEMENT, 'Stimmt nicht mit Masterkennwort im Set überein.');
        return;
    }

    SET_PASSWORD_ERROR_ELEMENT.hidden = true;

    loadEntries();
}

function onNewSetCreated() {
    let setName = NEW_SET_NAME_ELEMENT.value;

    if (setName === "") {
        printText(NEW_SET_ERROR_ELEMENT, 'Bitte geben Sie einen Setnamen an.');
        return;
    }

    let setKey = NEW_SET_PASSWORD_ELEMENT.value;

    if (setKey === "") {
        printText(NEW_SET_ERROR_ELEMENT, 'Bitte geben Sie ein Masterkennwort an.');
        return;
    }

    NEW_SET_ERROR_ELEMENT.hidden = true;

    setCurrentSet(new PasswordSet(setName, setKey));
}

function onNewEntryCreated() {
    entryInEditIndex = currentSet.entries.length;

    currentSet.addEntry();
    currentSet.buildEntryInEditElement(entryInEditIndex);
}

function main() {

    NEW_SET_SUBMIT_ELEMENT.addEventListener('click', onNewSetCreated);
}

main();