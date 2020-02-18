/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import engagementType from '@salesforce/apex/TimeSheetEngagement.getEngagementType';
import linkedEngagementype from '@salesforce/apex/TimeSheetEngagement.getLinkedEngagementype';
import updateEngagement from '@salesforce/apex/TimeSheetEngagement.updateEngagement';

export default class TimeSheetEngagement extends LightningElement {
    @api recordId;
    @track EngagementType=[];
    @track errors = [];
    @track LinkedEngagementType=[];
    @track isTrue = true;


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
   
    showType(){
 
        if(this.recordId!=='' && this.recordId!==undefined){
            linkedEngagementype({recordId:this.recordId})
            .then(results => {
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

    
    linkedHandle(event){
        let linkedEngagementypeClone = { ...this.LinkedEngagementType};
        const selection = event.target.parentNode.dataset.rowindex;
        linkedEngagementypeClone.LinkedTimeSheetTypeList[selection].isCheck =linkedEngagementypeClone.LinkedTimeSheetTypeList[selection].isCheck === true ? false : true;
        this.LinkedEngagementType = linkedEngagementypeClone;
          
    }

    unlinkedHandle(event){
        let linkedEngagementypeClone = { ...this.LinkedEngagementType};
        const selection = event.target.parentNode.dataset.rowindex;
        linkedEngagementypeClone.UnlinkedTimeSheetTypeList[selection].isCheck =linkedEngagementypeClone.UnlinkedTimeSheetTypeList[selection].isCheck === true ? false : true;
        this.LinkedEngagementType = linkedEngagementypeClone;
    }
    saveMethod() {
        if(this.recordId!=='' && this.recordId!==undefined){
            updateEngagement({updatedValue:JSON.stringify(this.LinkedEngagementType),recordId:this.recordId})
            .then(results => {
                this.EngagementType = results;
            })
            .catch(error => {
                // TODO: handle error
                this.errors.push(error);

            });
        }
        this.closeModal();
    }
    
}