/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import engagementType from '@salesforce/apex/TimeSheetEngagement.getEngagementType';
import linkedEngagementype from '@salesforce/apex/TimeSheetEngagement.getLinkedEngagementype';

export default class TimeSheetEngagement extends LightningElement {
    @api recordId;
    @track EngagementType=[];
    @track errors = [];
    @track LinkedEngagementType=[];
    //console.log();

    connectedCallback() {
        

        if(this.recordId!=='' && this.recordId!==undefined){
            engagementType({recordId:this.recordId})
            .then(results => {
                this.EngagementType = results;
        
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }
    }

    

    @track openmodel = false;
    // openmodal() {
    //     this.openmodel = true
    // }
    showType(){
        console.log('Hello Edit');
        if(this.recordId!=='' && this.recordId!==undefined){
            linkedEngagementype({recordId:this.recordId})
            .then(results => {
                console.log('results ',results);
                this.LinkedEngagementType = results;
        
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);
            });
        }
        this.openmodel = true
    }
    closeModal() {
        this.openmodel = false
    } 
    saveMethod() {
      
        console.log('save method invoked');
        this.closeModal();
    }
    
}