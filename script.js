const NEW_SET_FORM_ELEMENT = document.getElementById('new-set-form');
const NEW_SET_NAME_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-name');
const NEW_SET_PASSWORD_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-password');
const NEW_SET_SUBMIT_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-submit');
const NEW_SET_ERROR_ELEMENT = NEW_SET_FORM_ELEMENT.querySelector('#new-set-error');

const IMPORT_SET_BUTTON_ELEMENT = document.getElementById('import-set-button');
const EXPORT_SET_BUTTON_ELEMENT = document.getElementById('export-set-button');

const SET_PASSWORD_FORM_ELEMENT = document.getElementById('set-password-form');
const SET_PASSWORD_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password');
const SET_PASSWORD_SUBMIT_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password-submit');
const SET_PASSWORD_ERROR_ELEMENT = SET_PASSWORD_FORM_ELEMENT.querySelector('#set-password-error');

const ENTRY_LIST_HEADER_TEXT_ELEMENT = document.getElementById('entry-list-header-text');
const ENTRY_LIST_ELEMENT = document.getElementById('entry-list');

const NEW_ENTRY_BUTTON_ELEMENT = document.getElementById('new-entry-add');

const ENTRY_ELEMENT_TEMPLATE = document.getElementById('entry-element-template');
const ENTRY_ELEMENT_INEDIT_TEMPLATE = document.getElementById('entry-element-inedit-template');

const LOCAL_STORAGE_KEY_SET = 'LocalSet';

let currentSet = null;

class PasswordSet {

    constructor(name = '', key = '') {
        this.name = name;
        this.check = '';
        
        if (key !== '')
            this.check = this.encrypt(name, key);

        this.eKey = '';
        this.dKey = '';
        this.entryMap = new Map();
        this.data = '';
    }

    encrypt(text, key) {
        let result = '';

        for (let i = 0; i < text.length; i++)
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));

        return result;
    }

    decrypt(text, key) {
        
        return this.encrypt(text, key);
    }

    setMasterKey(key) {

        this.eKey = key;
        this.dKey = key;
    }
    
    validateKeys() {
        const success = this.name === this.decrypt(this.check, this.dKey) && this.check === this.encrypt(this.name, this.eKey);
        
        if (!success)
            return false;

        if (this.data !== '') {
            let entries;

            try {
                entries = JSON.parse(this.decrypt(this.data, this.dKey)); 
            } catch {
                return false;
            }

            this.entryMap = new Map(Object.entries(entries));
        }

        return true; 
    }

    loadSetFromJson(jsonString) {
        const localSet = JSON.parse(jsonString);

        this.name = localSet.name;
        this.check = localSet.check;
        this.data = localSet.data;
        return true;
    }

    loadSetFromLocalStorage() {
        const localSetString = localStorage.getItem(LOCAL_STORAGE_KEY_SET);

        if (!localSetString)
            return false;

        return this.loadSetFromJson(localSetString);
    }

    saveSetToJson() {
        const dataString = JSON.stringify(Object.fromEntries(this.entryMap));
        const localSet = {
            name: this.name,
            check: this.check,
            data: this.encrypt(dataString, this.eKey),
        };

        return JSON.stringify(localSet);
    }

    saveSetToLocalStorage() {
        
        localStorage.setItem(LOCAL_STORAGE_KEY_SET, this.saveSetToJson());
    }

    getPassword(username) {

        return this.entryMap.get(username);
    }

    addEntry(username, password) {

        this.entryMap.set(username, password);
        this.saveSetToLocalStorage();
    }

    removeEntry(username) {

        this.entryMap.delete(username);
        this.saveSetToLocalStorage();
    }
}

function buildEntryElement() {
    const entryElement = document.createElement('form');
    
    entryElement.classList.add('entry-element')
    ENTRY_LIST_ELEMENT.appendChild(entryElement);
    return entryElement;
}

function fillEntryElement(entryElement, username) {
    entryElement.innerHTML = ENTRY_ELEMENT_TEMPLATE.innerHTML;

    let entryNameElement = entryElement.querySelector('.entry-name');
    let entryPasswordElement = entryElement.querySelector('.entry-password');

    entryNameElement.textContent = username;
    entryPasswordElement.textContent = currentSet.getPassword(username);

    let entryEditButtonElement = entryElement.querySelector('.entry-edit-button');
    let entryDeleteButtonElement = entryElement.querySelector('.entry-delete-button');

    entryEditButtonElement.addEventListener('click', onEntryEdit);
    entryDeleteButtonElement.addEventListener('click', onEntryDeleted);
}

function fillEntryInEditElement(entryElement, username, password) {
    entryElement.innerHTML = ENTRY_ELEMENT_INEDIT_TEMPLATE.innerHTML;

    let entryNameElement = entryElement.querySelector('.entry-name');
    let entryPasswordElement = entryElement.querySelector('.entry-password');

    if (username !== '') {
        entryNameElement.placeholder = username;
        entryNameElement.value = entryNameElement.placeholder;

    }

    if (password !== '') {
        entryPasswordElement.placeholder = password;
        entryPasswordElement.value = entryPasswordElement.placeholder;
    }

    let entrySaveElement = entryElement.querySelector('.entry-save-button');

    entrySaveElement.addEventListener('click', onEntryInEditSaved);
}

function setCurrentSet(passwordSet) {
    
    localStorage.setItem(LOCAL_STORAGE_KEY_SET, '');
    ENTRY_LIST_ELEMENT.innerHTML = '';

    if (!NEW_ENTRY_BUTTON_ELEMENT.disabled) {
        NEW_ENTRY_BUTTON_ELEMENT.disabled = true;

        NEW_ENTRY_BUTTON_ELEMENT.removeEventListener('click', onNewEntryCreated);
    }
   
    SET_PASSWORD_ELEMENT.disabled = false;
    SET_PASSWORD_SUBMIT_ELEMENT.disabled = false;

    SET_PASSWORD_SUBMIT_ELEMENT.addEventListener('click', onSetPasswortSubmitted);

    ENTRY_LIST_HEADER_TEXT_ELEMENT.textContent = 'Set "' + passwordSet.name + '" - Verschlüsselt';
    currentSet = passwordSet;
}

function printText(element, text) {
    element.textContent = text;
    element.hidden = false;
}

function loadEntries() {

    for (let [key, value] of currentSet.entryMap) {
       
        currentSet.addEntry(key, value);
        fillEntryElement(buildEntryElement(), key);
    };

    NEW_ENTRY_BUTTON_ELEMENT.disabled = false;

    NEW_ENTRY_BUTTON_ELEMENT.addEventListener('click', onNewEntryCreated);
}


function onSetPasswortSubmitted() {
    const enteredKey = SET_PASSWORD_ELEMENT.value;

    if (enteredKey === '') {
        printText(SET_PASSWORD_ERROR_ELEMENT, 'Bitte geben Sie ein Masterkennwort an.');
        return;
    }

    currentSet.setMasterKey(enteredKey);

    const success = currentSet.validateKeys();

    if (!success) {
        printText(SET_PASSWORD_ERROR_ELEMENT, 'Stimmt nicht mit Masterkennwort im Set überein.');
        return;
    }

    SET_PASSWORD_ERROR_ELEMENT.hidden = true;
    ENTRY_LIST_HEADER_TEXT_ELEMENT.textContent = 'Set "' + currentSet.name + '" - Alle Einträge:';

    loadEntries();
}

function onNewSetCreated() {
    const setName = NEW_SET_NAME_ELEMENT.value;
    const setKey = NEW_SET_PASSWORD_ELEMENT.value;

    if (setName === '' || setKey === '') {

        printText(NEW_SET_ERROR_ELEMENT, 'Bitte geben Sie Name und Kennwort an.');
        return;
    }

    NEW_SET_ERROR_ELEMENT.hidden = true;

    const localSet = new PasswordSet(setName, setKey);

    setCurrentSet(localSet);
}

function onSetImport(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const text = reader.result;
        const localSet = new PasswordSet();
        
        if (localSet.loadSetFromJson(text))
            setCurrentSet(localSet);
    }

    reader.readAsText(file);
}

function onSetExport() {
    const localSetJson = currentSet.saveSetToJson();
    const localSetString = 'data:text/json;charset=utf-8,' + encodeURIComponent(localSetJson);

    const linkElement = document.createElement('a');
    linkElement.href = localSetString;
    linkElement.download = 'local_set.json';

    linkElement.click();
    linkElement.remove();
}

function onNewEntryCreated() {
    const entryElement = buildEntryElement();

    fillEntryInEditElement(entryElement, '', '');
}

function onEntryInEditSaved(event) {
    const entryElement = event.target.parentElement.parentElement;
    const entryErrorElement = entryElement.querySelector('.entry-error');
    const username = entryElement.querySelector('.entry-name').value;
    const password = entryElement.querySelector('.entry-password').value;

    if (username === '' || password === '') {

        printText(entryErrorElement, 'Bitte geben Sie Nutzername und Kennwort an.');
        return
    }

    if (currentSet.entryMap.has(username)) {

        printText(entryErrorElement, 'Nutzername existiert im Set bereits.');
        return;
    }

    currentSet.addEntry(username, password);
    fillEntryElement(entryElement, username);
}

function onEntryEdit(event) {
    const entryElement = event.target.parentElement.parentElement;
    const username = entryElement.querySelector('.entry-name').textContent;
    const password = currentSet.getPassword(username);

    currentSet.removeEntry(username);
    fillEntryInEditElement(entryElement, username, password);
}

function onEntryDeleted(event) {
    const entryElement = event.target.parentElement.parentElement;
    const username = entryElement.querySelector('.entry-name').textContent;

    currentSet.removeEntry(username);
    entryElement.remove();
}

function main() {
    const localSet = new PasswordSet();
    const success = localSet.loadSetFromLocalStorage();

    if (success)
        setCurrentSet(localSet);

    if (currentSet === null) {
        SET_PASSWORD_ELEMENT.disabled = true;
        SET_PASSWORD_ELEMENT.value = '';
        SET_PASSWORD_SUBMIT_ELEMENT.disabled = true;

        SET_PASSWORD_SUBMIT_ELEMENT.removeEventListener('click', onSetPasswortSubmitted);
    }
  
    NEW_SET_SUBMIT_ELEMENT.addEventListener('click', onNewSetCreated);
    IMPORT_SET_BUTTON_ELEMENT.addEventListener('change', onSetImport);
    EXPORT_SET_BUTTON_ELEMENT.addEventListener('click', onSetExport);
}

main();