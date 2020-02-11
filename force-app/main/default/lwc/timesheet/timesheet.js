/* eslint-disable no-empty */
/* eslint-disable no-console */
import { LightningElement, track, api, wire} from 'lwc';
//import UserName from '@salesforce/schema/User.Name';
import { updateRecord } from 'lightning/uiRecordApi';
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
   
    @track user;
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
    @track ApprovalMessage = [];;
    @track isApprovalMessage;

    connectedCallback() {   
        //this.user = UserName;
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
            
            if(result.ApprovalMessage !== ''){
                this.isApprovalMessage = true;
                this.ApprovalMessage.push(result.ApprovalMessage);
            }
    
            if(this.TimeSheetFields!==undefined){
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

            if(this.TimeEntryFields!==undefined){
                let allFields=this.TimeEntryFields.fields;              
                for (let attr in allFields) {
                    if(allFields.hasOwnProperty(attr)){                       
                        let theField=allFields[attr];                       
                        if(theField.dataType === "Reference" && theField.custom===true && theField.apiName===this.basicSetting.EntryProjectField){
                            this.basicSetting.EntryProjectObject=theField.referenceToInfos[0].apiName;
                            this.basicSetting.EntryProjectObjectLabel=theField.label; 
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
    
    get getNewTimeSheetButtonClass(){
        if(this.readOnly === true){
            return  "slds-button slds-button_brand";
        }else{
            return "slds-button slds-button_brand slds-hide";
        }
       
    }

    newTimeSheet(){
        let selectDate = this.basicSetting.StartDate;
        let currentDate = new Date(selectDate);
        currentDate.setDate(currentDate.getDate() + 8);
        let month = currentDate.getMonth();
        month++;
        let startDate = currentDate.getFullYear()+'-'+month+'-'+currentDate.getDate();
        console.log(typeof startDate);
        console.log(startDate);
        this.basicSetting.StartDate = startDate;
        let locolBasicSetting  = this.cloneBasicStting(this.basicSetting);
        if(locolBasicSetting.DateLabel.toLowerCase()!=='day'){    
            this.spinner=true;
            getUpdateBasicSetting({baseSettingStr:JSON.stringify(locolBasicSetting)})
           .then(result => {
               console.log(result);
               if(result!==undefined){    
                  let cloneResult = this.cloneUpdateBasicSetting(result); 
                  console.log('cloneResult'); 
                  console.log(cloneResult);        
                  this.StartDate=cloneResult.StartDate;
                  this.basicSetting=cloneResult;
                  this.Name = cloneResult.Name;
                  this.isApprovalMessage = cloneResult.ApprovalMessage;
                  this.readOnly = cloneResult.readOnly;
                 
                  this.spinner=undefined;
                //   if(actualDate!==this.StartDate){
                //       console.log('************date changed');
                //     this.template.querySelector('c-time-entry').baseset(cloneResult);
                //   }
                
                  this.template.querySelector('c-time-entry').baseset(cloneResult);             
               }
           })
           .catch(error => {
               this.error = error;
           });
        }
        //VALIDATE THE DATE
     
       
    }

    summaryChange(event){
        let currentDate = new Date(this.StartDate);
        //currentDate.setDate(currentDate.getDate() + 8);
        let month = currentDate.getMonth();
        month++;
        let startDate = month+'-'+currentDate.getDate()+'-'+currentDate.getFullYear();
        let EntryDetail =[];
        EntryDetail=event.detail;
        let total = EntryDetail.reduce((a,b) => a + b, 0);
        if(total === 0){
            this.Name = this.user+' - '+startDate;
            this.basicSetting.Name = this.Name;
        }
        console.log('UserName ',this.user);
        this.summaryData = total;
        window.setTimeout(
            () => { 
                let lookups=this.template.querySelector('c-lookup').getName(this.EmpId);
                console.log('lookups User ',lookups);
                //let lookups1=this.template.querySelectorAll('c-lookup').getSelection();
                //console.log('lookups User1 ',lookups1);
             }, 7000
        );
        
        //this.summaryData = this.summaryData +'Hrs';
    }

    handleSelectionChange(event) {
        const selection = event.target.getSelection();
        console.log('my User Name',selection);
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
        //let actualDate=this.basicSetting.StartDate;
        const selection = event.target.value;
        let locolBasicSetting  = this.cloneBasicStting(this.basicSetting);
        locolBasicSetting.StartDate=selection;
        //locolBasicSetting.TotalHours = this.summaryData;
        console.log(locolBasicSetting);
        if(locolBasicSetting.DateLabel.toLowerCase()!=='day'){    
            this.spinner=true;
            getUpdateBasicSetting({baseSettingStr:JSON.stringify(locolBasicSetting)})
           .then(result => {
               console.log(result);
               if(result!==undefined){    
                  let cloneResult = this.cloneUpdateBasicSetting(result); 
                  console.log('cloneResult'); 
                  console.log(cloneResult);        
                  this.StartDate=cloneResult.StartDate;
                  this.basicSetting=cloneResult;
                  this.Name = cloneResult.Name;
 
                  this.spinner=undefined;
                //   if(actualDate!==this.StartDate){
                //       console.log('************date changed');
                //     this.template.querySelector('c-time-entry').baseset(cloneResult);
 
                  this.template.querySelector('c-time-entry').baseset(cloneResult);
                    
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
        //console.log(JSON.stringify(this.basicSetting));
        let newObj=this.cloneObject(EntryDetail.timeEntries);
        //newObj.TotalHours = this.summaryData;
        newObj.TotalHours = EntryDetail.tHour;
        console.log('localsetting ',newObj);
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
                        updateRecord({ fields: { Id: result.RecordId } });
                        //eval("$A.get('e.force:refreshView').fire()");
                        //console.log('refresh ho gaya');
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
        //eval("$A.get('e.force:refreshView').fire();");
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
        this.basicSetting.TotalHours = this.summaryData;
      //  if(recordId!==undefined && recordId!==null && recordId!==''){
          console.log('this.basicSetting before save ',this.basicSetting);
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