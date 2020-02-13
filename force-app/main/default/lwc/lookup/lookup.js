/* eslint-disable no-console */
import { LightningElement, track, api } from 'lwc';
import apexSearch from '@salesforce/apex/LookupController.getSearchResult';
import apexDefault from '@salesforce/apex/LookupController.getDefaultResult';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class Lookup extends LightningElement {
    @api label;
    @api selection = [];
    @api placeholder = '';
    @api isMultiEntry = false;
    @track errors = [];
    @api scrollAfterNItems;
    @api customKey;
    @api sobjectname;
    @api currentrecord='';
    @api readonlyrecord=false;
    @api index;
    @api fieldname='';
    @api parentRecord;

    @track searchTerm = '';
    @track searchResults = [];
    @track hasFocus = false;
    @track RemoveClose=false;
    @api lebelhiden=false;
    cleanSearchTerm;
    blurTimeout;
    searchThrottlingTimeout;
  
    //SET DEFAULT RECORD FOR VIEW
    connectedCallback() {
        if(this.readonlyrecord===true)
            this.RemoveClose=true;

        if(this.currentrecord!=='' && this.currentrecord!==undefined){
            apexDefault({recordId:this.currentrecord,sObjectName:this.sobjectname})
            .then(results => {
                console.log(results)
                this.setSearchResults(results);
                let selectedItem = results[0];
                const newSelection = [...this.selection];
                newSelection.push(selectedItem);
                this.selection = newSelection;
        
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }
    }

    // EXPOSED FUNCTIONS
   
    @api
    setSearchResults(results) {
        this.searchResults = results.map(result => {
            // Clone and complete search result if icon is missing
            if (typeof result.icon === 'undefined') {
                const { id, sObjectType, title, subtitle } = result;
                return {
                    id,
                    sObjectType,
                    icon: 'standard:default',
                    title,
                    subtitle
                };
            }
            return result;
        });
    }

    @api
    resetSelection() {
        this.selection=[];
    }

    @api
    setSelection(value){     
       console.log('***** set');
       this.currentrecord=value;
       console.log('********* '+this.currentrecord);
        if(this.currentrecord!=='' && this.currentrecord!==undefined){
            apexDefault({recordId:this.currentrecord,sObjectName:this.sobjectname})
            .then(results => {
                console.log(results)
                this.setSearchResults(results);
                let selectedItem = results[0];
                const newSelection = [...this.selection];
                newSelection.push(selectedItem);
                this.selection = newSelection;
                console.log(this.selection);
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }
    }

    @api
    getSelection() {
        //console.log('Heloo',this.selection.title);
        return this.selection;
    }
   
    @api 
    getIndex(){
        return this.index;
    }

    @api 
    getFieldName(){
        return this.fieldname;
    }

    @api
    getkey() {
        return this.customKey;
    }

    // INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {
        console.log(newSearchTerm);
        this.searchTerm = newSearchTerm;
      
        // Compare clean new search term with current one and abort if identical
        const newCleanSearchTerm = newSearchTerm
            .trim()
            .replace(/\*/g, '')
            .toLowerCase();
        if (this.cleanSearchTerm === newCleanSearchTerm) {
            return;
        }
        console.log(this.cleanSearchTerm);
        // Save clean search term
        this.cleanSearchTerm = newCleanSearchTerm;

        // Ignore search terms that are too small
        if (newCleanSearchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
            this.searchResults = [];
            return;
        }

        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            clearTimeout(this.searchThrottlingTimeout);
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchThrottlingTimeout = setTimeout(() => {
            // Send search event if search term is long enougth
            if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                console.log('************parentRecord'+this.parentRecord);
                //CALL SERVER HERE AND UPDATE RESULT              
               apexSearch({searchTerm:this.cleanSearchTerm,sObjectName:this.sobjectname,parentRecord:this.parentRecord})
               .then(results => {
                   console.log(results)
                   this.setSearchResults(results);
               })
               .catch(error => {
                   // TODO: handle error
                   this.errors.push(error);
               });
            }
            this.searchThrottlingTimeout = null;
        }, SEARCH_DELAY);
    }

    isSelectionAllowed() {
        if (this.isMultiEntry) {
            return true;
        }
        return !this.hasSelection();
    }

    hasResults() {
        return this.searchResults.length > 0;
    }

    hasSelection() {
        return this.selection.length > 0;
    }

    // EVENT HANDLING

    handleInput(event) {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.updateSearchTerm(event.target.value);
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;

        // Save selection
        let selectedItem = this.searchResults.filter(
            result => result.id === recordId
        );
        if (selectedItem.length === 0) {
            return;
        }
        selectedItem = selectedItem[0];
        const newSelection = [...this.selection];
        newSelection.push(selectedItem);
        this.selection = newSelection;

        // Reset search
        this.searchTerm = '';
        this.searchResults = [];

        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange'));
    }

    handleComboboxClick() {
        // Hide combobox immediatly
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
        }
        this.hasFocus = false;
    }

    handleFocus() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.hasFocus = true;
    }

    handleBlur() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
            this.hasFocus = false;
            this.blurTimeout = null;
        }, 300);
    }

    handleRemoveSelectedItem(event) {
        const recordId = event.currentTarget.name;
        this.selection = this.selection.filter(item => item.id !== recordId);
        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange'));
    }

    handleClearSelection() {
        this.selection = [];
        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange'));
    }

    // STYLE EXPRESSIONS

    get getContainerClass() {
        let css = 'slds-combobox_container slds-has-inline-listbox ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-has-input-focus ';
        }
        if (this.errors.length > 0) {
            css += 'has-custom-error';
        }
        return css;
    }

    get getDropdownClass() {
        let css =
            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-is-open';
        } else {
            css += 'slds-combobox-lookup';
        }
        return css;
    }

    get getInputClass() {
        let css =
            'slds-input slds-combobox__input has-custom-height ' +
            (this.errors.length === 0 ? '' : 'has-custom-error ');
        if (!this.isMultiEntry) {
            css +=
                'slds-combobox__input-value ' +
                (this.hasSelection() ? 'has-custom-border' : '');
        }
        return css;
    }

    get getComboboxClass() {
        let css = 'slds-combobox__form-element slds-input-has-icon ';
        if (this.isMultiEntry) {
            css += 'slds-input-has-icon_right';
        } else {
            css += this.hasSelection()
                ? 'slds-input-has-icon_left-right'
                : 'slds-input-has-icon_right';
        }
        return css;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
        if (!this.isMultiEntry) {
            css += this.hasSelection() ? 'slds-hide' : '';
        }
        return css;
    }

    get getClearSelectionButtonClass() {
        return (
            'slds-button slds-button_icon slds-input__icon slds-input__icon_right ' +
            (this.hasSelection() ? '' : 'slds-hide')
        );
    }

    get getSelectIconName() {
        return this.hasSelection()
            ? this.selection[0].icon
            : 'standard:default';
    }

    get getSelectIconClass() {
        return (
            'slds-combobox__input-entity-icon ' +
            (this.hasSelection() ? '' : 'slds-hide')
        );
    }

    get getInputValue() {
        if (this.isMultiEntry) {
            return this.searchTerm;
        }
        return this.hasSelection() ? this.selection[0].title : this.searchTerm;
    }

    get getListboxClass() {
        return (
            'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid ' +
            (this.scrollAfterNItems
                ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems
                : '')
        );
    }

    get isInputReadonly() {
        if (this.isMultiEntry) {
            return false;
        }
        return this.hasSelection();
    }

    get isExpanded() {
        return this.hasResults();
    }
}