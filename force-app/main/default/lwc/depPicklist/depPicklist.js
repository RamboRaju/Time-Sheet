import { LightningElement, track, api } from 'lwc';
import picklistValue from '@salesforce/apex/LookupController.getPicklistResult';
import apexDefault from '@salesforce/apex/LookupController.getDefaultResult';

export default class DepPicklist extends LightningElement {
    
    @api sobjectname;
    @api label;
    @api customKey;
    @api index;
    @api isMultiEntry = false;
    @api selection ='';
    @api fieldname='';
    @api parentRecord;
    @api showhide = false;
    @api leftIcon;
    @track rightIcon;
    @api readOnly;
    @api readonlyrecord;
    @api currentrecord='';
    @api isDropdownOver = false;
    //@api isInputReadonly = true;

    @track picklistResults = [];
    @track errors = [];
    
    leftIcon = '';
    readOnly = true;
   connectedCallback(){
        this.rightIcon = 'utility:down';
        console.log('connectedCallback');
        if(this.currentrecord!=='' && this.currentrecord!==undefined){
            console.log('connectedCallback if');
            apexDefault({recordId:this.currentrecord,sObjectName:this.sobjectname})
            .then(results => {
                this.setPicklistResults(results); 
                let selectedItem = results[0];
                this.selection = selectedItem;
                this.leftIcon = this.selection.icon; 
                console.log(this.selection);
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }else{
            console.log('connectedCallback else');
            picklistValue({sObjectName:this.sobjectname,parentRecord:this.parentRecord})
            .then(results => {  
                this.setPicklistResults(results);
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }           
   }

   @track existRecord;
   @api
   setPicklistResults(results) {   
        if (results.some(e => e.id === this.currentrecord)) {         
            this.picklistResults = [];
            this.picklistResults = results.map(result => {
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
        }else{
            this.picklistResults = results.map(result => {
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
        
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;
        console.log(recordId);
        if(this.showhide === true)
        this.showhide = false;
        else 
        this.showhide = true;
        // Save selection
        let selectedItem = this.picklistResults.filter(
            result => result.id === recordId
        );
        if (selectedItem.length === 0) {
            return;
        }
        selectedItem = selectedItem[0];
       
        this.selection = selectedItem;
        console.log('selection '+this.selection);
        this.leftIcon = this.selection.icon; 

        this.isMultiEntry = true;

        // Reset search
        this.searchResults = [];

        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('picklistselection'));
    }

    @api
    setSelection(value){     
       this.currentrecord=value;
      
       console.log('********* setSelection'+this.currentrecord);
       if(this.currentrecord!=='' && this.currentrecord!==undefined){
        apexDefault({recordId:this.currentrecord,sObjectName:this.sobjectname})
            .then(results => {
                this.setPicklistResults(results); 
                let selectedItem = results[0];
                this.selection = selectedItem;
                this.leftIcon = this.selection.icon;
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
       }

       console.log();
       
    }

    @api
    getSelection() {
        return this.selection;
    }

    inputOnMouseOut(){
        window.setTimeout(() =>{
                if(this.isDropdownOver){
                    return;
                }
                else{
                    this.showhide = false;
                    //getListboxClass();
                }
               
            },200
        );     
    }

    dropDownOnMouseOut(){
        this.isDropdownOver = false;
        this.showhide = false;
    }

    dropDownOnMouseEnter(){
        this.isDropdownOver = true;
    }

    showDropDown(){    
       // this.picklistResults = [];
        console.log('from show drop down');
        //console.log('showDropDown',this.picklistResults[0].id);
        //let mydata = this.picklistResults;
        //console.log('mydata ',mydata[0].id);
       // this.existRecord = this.currentrecord;;
        picklistValue({sObjectName:this.sobjectname,parentRecord:this.parentRecord})
       .then(results => {
           this.setPicklistResults(results); 
           if(this.showhide === true)
           this.showhide = false;
           else 
           this.showhide = true;
       })
       .catch(error => {
           // TODO: handle error
           this.errors.push(error);
       });
       
    }

    get getInputValue() {
        if(this.selection !== ''){  
            return  this.selection.title;
        }else{
            this.leftIcon = '';
            return '';
        }
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
    resetSelection() {
        this.leftIcon = '';
        this.selection='';
    }

   get getListboxClass() {    
       if(this.showhide === true)
        return ( 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-scrollabl slds-show ');
        else 
        return ( 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-scrollabl slds-hide ');   
    }

    get getInputClass() {
        let css =
            'slds-input slds-combobox__input has-custom-height slds-scrollable_y' +
            (this.errors.length === 0 ? '' : 'has-custom-error ');
        return css;
    }

    get getLeftIconClass(){
        let css = 'slds-icon slds-input__icon slds-input__icon_left';
        return css;
    }

    get getRightIconClass(){
        let css = 'slds-icon slds-input__icon slds-input__icon_right';
        return css;

    }

    get getComboboxClass() {
        let css = 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right';
        return css;
    }

    
}
