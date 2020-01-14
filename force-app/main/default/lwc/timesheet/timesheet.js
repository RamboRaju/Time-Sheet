/* eslint-disable no-empty */
/* eslint-disable no-console */
import { LightningElement, track, api, wire} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basicSetting from '@salesforce/apex/ganttController.getBasicSetting';
//import getValidDate  from '@salesforce/apex/ganttController.getValidDate';
import SaveTimeSheet  from '@salesforce/apex/ganttController.SaveTimeSheet';
import getUpdateBasicSetting  from '@salesforce/apex/ganttController.getUpdateBasicSetting';

import TimeSheet from '@salesforce/schema/TimeSheet__c';
import TimeEntry from '@salesforce/schema/Time_Entry__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
export default class Timesheet extends  NavigationMixin(LightningElement) {
   
    @api recordId;
    @track basicSetting;
    @track StartDate;
    @track EndDate;
    @track EmpId;
    @track Name;
    @track summaryData = 0;

    @track EmployeeField;
    @track EntryProjectField;
    @track EntryTaskField;
   

    @track EntryProjectObject;
    @track EntryTaskObject;
    @track EmployeeFieldObject;
    @track EmployeeFieldObjLabel;

    @track TimeSheetFields;
    @track TimeEntryFields;
    @track error;

    @track dateLabel;
    @track DateReadOnly=false;
    @track spinner=undefined;

    @track readOnly=false;
    @track showMessage=false;
    @track messages=[];
    @track userSetup=false;
    @track EmployeeReadOnly=true;

    connectedCallback() {   
        if(this.recordId!==undefined && this.recordId!=='')
            this.DateReadOnly=true;

        basicSetting({recordId:this.recordId})
        .then(result => {
            this.userSetup=true;
            this.readOnly=result.readOnly;
            this.basicSetting = result;
            this.StartDate=result.StartDate;
            this.EmpId=result.SelectedEmp;
            this.Name=result.Name;
            this.dateLabel=result.DateLabel;
            
            this.EmployeeField=result.EmployeeField;
            this.EntryProjectField=result.EntryProjectField;
            this.EntryTaskField=result.EntryTaskField;

            console.log('the final result');
            console.log(result);
            if(this.TimeSheetFields!==undefined){
                let allFields=this.TimeSheetFields.fields;              
                for (let attr in allFields) {
                    if(allFields.hasOwnProperty(attr)){                       
                        let theField=allFields[attr];   
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.EmployeeField){
                            this.EmployeeFieldObject=theField.referenceToInfos[0].apiName;
                            this.EmployeeFieldObjLabel=theField.label; 
                            console.log(this.EmployeeFieldObject);
                            console.log('Hello');      
                            this.basicSetting.EmployeeFieldObject=this.EmployeeFieldObject; 
                            console.log('Hello main chal gaya');
                            this.basicSetting.EmployeeFieldObjectLabel=this.EmployeeFieldObjLabel;          
                        }  
                    }
                }
            }

            if(this.TimeEntryFields!==undefined){
                // console.log('from connected call back '+this.basicSetting.EntryProjectObjectLabel);
                let allFields=this.TimeEntryFields.fields;              
                for (let attr in allFields) {
                    if(allFields.hasOwnProperty(attr)){                       
                        let theField=allFields[attr];                       
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.basicSetting.EntryProjectField){
                            this.basicSetting.EntryProjectObject=theField.referenceToInfos[0].apiName;
                            this.basicSetting.EntryProjectObjectLabel=theField.label; 
                            // console.log('from connected call back '+this.basicSetting.EntryProjectObjectLabel);
                        }
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.basicSetting.EntryTaskField){
                            this.basicSetting.EntryTaskObject=theField.referenceToInfos[0].apiName;
                            this.basicSetting.EntryTaskObjectLabel=theField.label; 
                        }

                    }
                }
            }
        })
        .catch(error => {
            this.error = error;
        });
    }
    
    @wire(getObjectInfo, { objectApiName: TimeSheet})
    wiredFields({ error, data }) {
        console.log('in wire method');
        if (data) {                  
            this.TimeSheetFields = data;
            this.error = undefined;

            if(this.basicSetting!==undefined){
                let allFields=this.TimeSheetFields.fields;              
                for (let attr in allFields) {
                    if(allFields.hasOwnProperty(attr)){
                        let theField=allFields[attr];
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.EmployeeField){
                            this.EmployeeFieldObject=theField.referenceToInfos[0].apiName;
                            this.EmployeeFieldObjLabel=theField.label;   
                            this.basicSetting.EmployeeFieldObject=this.EmployeeFieldObject;
                            this.basicSetting.EmployeeFieldObjectLabel=this.EmployeeFieldObjLabel;          
                        }                        
                    }
                }
            }

        } else if (error) {          
            this.error = error;
            this.TimeSheetFields = undefined;
        }
      
    }

    @wire(getObjectInfo, { objectApiName: TimeEntry })
    wiredetFields({ error, data }) {
        console.log('Inside timeentry wire timeEntery ');
        if (data) {                  
            this.TimeEntryFields = data;
            this.error = undefined;
            //console.log('from wire method '+this.basicSetting.EntryProjectObjectLabel);
            if(this.basicSetting!==undefined){
                // console.log('from wire method '+this.basicSetting.EntryProjectObjectLabel);
                let allFields=this.TimeEntryFields.fields;              
                for (let attr in allFields) {
                    if(allFields.hasOwnProperty(attr)){
                        let theField=allFields[attr];
                        
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.basicSetting.EntryProjectField){
                            this.basicSetting.EntryProjectObject=theField.referenceToInfos[0].apiName;
                            this.basicSetting.EntryProjectObjectLabel=theField.label; 
                            // console.log('from wire method '+this.basicSetting.EntryProjectObjectLabel);
                            }
                      
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.basicSetting.EntryTaskField){
                            this.basicSetting.EntryTaskObject=theField.referenceToInfos[0].apiName;
                            this.basicSetting.EntryTaskObjectLabel=theField.label; 
                        }     
                    }
                }
            }

        } else if (error) {          
            this.error = error;
            this.TimeEntryFields = undefined;
        }
      
    }

    @wire(getObjectInfo, { objectApiName: TimeEntry })
    wiredEntryFields({ error, data }) {
        
        if (data) {                  
            this.TimeEntryFields = data;
            this.error = undefined;
        } else if (error) {          
            this.error = error;
            this.TimeEntryFields = undefined;
        }
      
    }

    summaryChange(event){
        let EntryDetail =[];
        EntryDetail=event.detail;
        let total = EntryDetail.reduce((a,b) => a + b, 0);
        this.summaryData = total;
        this.summaryData = this.summaryData +'Hrs';

    }

    handleSelectionChange(event) {
        const selection = event.target.getSelection();
        console.log(selection);
        // TODO: do something with the lookup selection
    }

    handleNameChange(event){
        const selection = event.target.value;
        this.Name=selection;
        this.basicSetting.Name=selection;
    }
    cloneUpdateBasicSetting(result1){
        let result ;
        result = JSON.parse(JSON.stringify(result1));
        return result;
    }
    cloneBasicStting(setting){
        let basicSetting;
        basicSetting  = JSON.parse(JSON.stringify(setting));
        return basicSetting;
    }
    handleStartDateChange(event) {
        let actualDate=this.basicSetting.StartDate;
        const selection = event.target.value;
        let locolBasicSetting  = this.cloneBasicStting(this.basicSetting);
        locolBasicSetting.StartDate=selection;
        console.log(selection);
        if(locolBasicSetting.DateLabel.toLowerCase()!=='day'){    
            this.spinner=true;
            getUpdateBasicSetting({baseSettingStr:JSON.stringify(locolBasicSetting)})
           .then(result => {
               console.log(result);
               if(result!==undefined){    
                  let cloneResult = this.cloneUpdateBasicSetting(result);          
                  this.StartDate=cloneResult.StartDate;
                  this.basicSetting=cloneResult;
                  this.spinner=undefined;
                  if(actualDate!==this.StartDate){
                      console.log('************date changed');
                    this.template.querySelector('c-time-entry').baseset(cloneResult);
                  }
                    
               }
           })
           .catch(error => {
               this.error = error;
           });
        }
        //VALIDATE THE DATE
    }

    cloneObject(theentries){

        let localsetting=this.basicSetting.constructor();
        for (let attr in this.basicSetting) {
            if (this.basicSetting.hasOwnProperty(attr) && attr!=='timeEntries'){
                localsetting[attr] = this.basicSetting[attr];
            }
            if(this.basicSetting.hasOwnProperty(attr) && attr==='timeEntries'){
                localsetting.timeEntries=theentries;
            }
        } 
        return localsetting;
    }

    entryChange(event){
        this.showMessage=false;
        let EntryDetail=event.detail;
      //  this.basicSetting.timeEntries=EntryDetail.timeEntries;
        let buttonType=EntryDetail.button;
        console.log(buttonType);
        console.log(JSON.stringify(this.basicSetting));
        let newObj=this.cloneObject(EntryDetail.timeEntries);
        if(buttonType==='SAVE' || buttonType==='SUBMIT'){
            SaveTimeSheet({finalResponse:JSON.stringify(newObj),mode:buttonType})
            .then(result => {
                console.log(result);
                if(result!==undefined){      
                    if(result.status===true){
                        console.log(JSON.stringify(result));
                        console.log('redirect');
                        console.log(this.recordId);
                        this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: result.RecordId,
                                objectApiName: 'TimeSheet__c',
                                actionName: 'view'
                            },
                        });
                    }else{
                        console.log(result.Messages);
                        this.showMessage=true;
                        this.messages=result.Messages;
                    }
                }
            })
            .catch(error => {
                this.error = error;
            });
        }
/** 
        
        if(buttonType==='SUBMIT'){
            SaveTimeSheet({finalResponse:JSON.stringify(this.basicSetting)})
            .then(result => {
                console.log(result);
                if(result!==undefined){              
                    console.log(JSON.stringify(result));
                    console.log('redirect');
                    console.log(this.recordId);
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result.RecordId,
                            objectApiName: 'TimeSheet__c',
                            actionName: 'view'
                        },
                    });
                }
            })
            .catch(error => {
                this.error = error;
            });
        }
**/
        if(buttonType==='CANCEL'){
            if(this.recordId){
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: 'TimeSheet__c',
                        actionName: 'view'
                    },
                });
            }else{
                 // Navigate to the Account home page
                this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'TimeSheet__c',
                        actionName: 'home',
                    },
                });
            }
        }
    }

    saveSetting(event){
        console.log('**************');
        console.log(event.detail);
       // let recordId=this.basicSetting.Recordid;
        let obj = JSON.parse(event.detail);

        this.basicSetting.ShowWeekend=obj.ShowWeekend;
        this.basicSetting.HideTask=obj.HideTask;
        this.basicSetting.TaskRequired=obj.TaskRequired;
        this.basicSetting.DateOnly=obj.DateOnly;
        this.basicSetting.DayOnly=obj.DayOnly;
        this.basicSetting.ShortDaywithDate=obj.ShortDaywithDate;
      //  if(recordId!==undefined && recordId!==null && recordId!==''){
            this.spinner=true;
            getUpdateBasicSetting({baseSettingStr:JSON.stringify(this.basicSetting)})
            .then(result => {
                console.log('************* server result');
                console.log(result);
                if(result!==undefined){              
                   this.basicSetting=result;
                   this.spinner=undefined;                  
                      this.template.querySelector('c-time-entry').baseset(result);           
                }
            })
            .catch(error => {
                this.error = error;
            });
      //  }
       
    }
}