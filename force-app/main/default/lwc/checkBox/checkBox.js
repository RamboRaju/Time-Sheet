/* eslint-disable no-console */
import { LightningElement,api,track} from 'lwc';

export default class CheckBox extends LightningElement {
    @api thevalue;
    @api name;
    @track value;
    
    connectedCallback() {
        this.value=this.thevalue;
    }

    @api
    getName(){
        return this.name;
    }

    @api
    SetValue(value){
        this.value=value;
    }

    handleChange(event) {
        this.value=event.target.checked;
      
        event.preventDefault();
        let passData={};
        passData.value=this.value;
        passData.name=this.name;

        const selectEvent = new CustomEvent('select', {
            detail: JSON.stringify(passData)
        });
      
        this.dispatchEvent(selectEvent);
    }

}