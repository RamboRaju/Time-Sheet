/* eslint-disable no-console */
import { LightningElement, track } from 'lwc';
import getDefaultSetup from '@salesforce/apex/SetupController.getDefaultSetup';
export default class Setup extends LightningElement {
    
    @track setup;
    @track holiday;
    @track leave;
    @track error;

    @track activeSections = ['A'];
    @track activeSectionsMessage = '';

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }

    connectedCallback() {
        getDefaultSetup()
        .then(result => {
            this.setup = result.BaseSetting;
            console.log(result);
        })
        .catch(error => {
            this.error = error;
        });
    }

}