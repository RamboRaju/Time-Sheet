/* eslint-disable no-console */
import { LightningElement, track, api, wire} from 'lwc';
import TimeSheet from '@salesforce/schema/TimeSheet__c';
import TimeEntry from '@salesforce/schema/Time_Entry__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import SaveBasicSetting from '@salesforce/apex/SetupController.SaveBasicSetting';

export default class BasicSetting extends LightningElement {
    @api basesetting;
    @track BasicSetting;
    @track TimeSheetFields;
    @track TimeEntryFields;
    @track error;
    @track dmlerror;
    @track savedSuccess;
    @track savedError;
    @track ShowSpinner=false;
  

    connectedCallback() {
        this.BasicSetting = this.basesetting.constructor();
        for (let attr in this.basesetting) {
            if (this.basesetting.hasOwnProperty(attr)) this.BasicSetting[attr] = this.basesetting[attr];
        }
    }

    saveBasic(){
         this.savedSuccess=false;
         this.savedError=false;
         this.ShowSpinner=true;
         let valid=true;
         //VALIDATE 
         if(this.BasicSetting) {
             if(this.BasicSetting.HideTask===true && this.BasicSetting.TaskRequired===true){
                this.BasicSetting.TaskRequired=false;
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='TaskRequired'){
                        checkbox[i].SetValue(false);
                    }
                }
             }

             if(this.BasicSetting.DateOnly===false && this.BasicSetting.DayOnly===false 
                && this.BasicSetting.ShortDaywithDate===false){
                    this.BasicSetting.DateOnly=true;
                    let checkbox=this.template.querySelectorAll('c-check-Box');
                    for(let i=0;i<checkbox.length;i++){
                        let name=checkbox[i].getName();     
                        if(name==='DateOnly'){
                            checkbox[i].SetValue(true);
                        }
                    }
             }
         }
        
        if(valid){
            SaveBasicSetting({BasicSetting:JSON.stringify(this.BasicSetting)})
            .then(result => {
                if(result===''){
                    this.savedSuccess=true;
                    this.savedError=false;
                }else{
                    this.savedError=true;
                    this.savedSuccess=false;
                }
            
                this.dmlerror=result;
                console.log(result);
                this.ShowSpinner=false;         
            })
            .catch(error => {
                this.dmlerror = error;
                this.ShowSpinner=false;
                this.savedError=true;
            });
        }
    }

    @wire(getObjectInfo, { objectApiName: TimeSheet })
    wiredFields({ error, data }) {        
        if (data) {                  
            this.TimeSheetFields = data;
            this.error = undefined;
        } else if (error) {          
            this.error = error;
            this.TimeSheetFields = undefined;
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

    get fields() {
        let options=[];
       
        if(this.TimeSheetFields){
            let allFields=this.TimeSheetFields.fields;
            for (let attr in allFields) {
                if(allFields.hasOwnProperty(attr)){
                    let theField=allFields[attr];
                    if(theField.dataType === "Reference" && theField.custom===true){
                        let oneOpt={};
                        oneOpt.label=theField.label;
                        oneOpt.value=theField.apiName;
                        options.push(oneOpt);
                    }          
                }
            }
        }
        return options;
    }

    get days() {
        let options=[];
        
        let oneOpt={};
        oneOpt.label='SUNDAY';
        oneOpt.value='SUNDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='MONDAY';
        oneOpt.value='MONDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='TUEDAY';
        oneOpt.value='TUEDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='WEDNESDAY';
        oneOpt.value='WEDNESDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='THURSDAY';
        oneOpt.value='THURSDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='FRIDAY';
        oneOpt.value='FRIDAY';
        options.push(oneOpt);
        oneOpt={};
        oneOpt.label='SATURDAY';
        oneOpt.value='SATURDAY';
        options.push(oneOpt);
      
        return options;
    }


    get Entryfields() {
        let options=[];
       
        if(this.TimeEntryFields){
            let allFields=this.TimeEntryFields.fields;
            console.log(this.TimeEntryFields);
            for (let attr in allFields) {
                if(allFields.hasOwnProperty(attr)){
                    let theField=allFields[attr];
                    if(theField.dataType === "Reference" && theField.custom===true && theField.apiName!=='TimeSheet__c'){
                        let oneOpt={};
                        oneOpt.label=theField.label;
                        oneOpt.value=theField.apiName;
                        options.push(oneOpt);
                    }          
                }
            }
        }
        return options;
    }


    get options() {
        let options=[];
        let theIntervals=this.basesetting.DefaultIntervals;

        for(let i=0;i<theIntervals.length;i++){
            let oneOpt={};
            oneOpt.label=theIntervals[i];
            oneOpt.value=theIntervals[i];
            options.push(oneOpt);
        }
        return options;
    }
    
    handleChange(event) {
        this.BasicSetting.DefaultInterval = event.detail.value;
    }

    handleProjectChange(event) {
        this.BasicSetting.ProjectField = event.detail.value;
    }

    handleEntryProjectChange(event) {
        this.BasicSetting.EntryProjectField = event.detail.value;
    }
    handleEntryTaskChange(event) {
        this.BasicSetting.EntryTaskField = event.detail.value;
    }

    handleWeekStartChange(event) {
        this.BasicSetting.WeekStartDay = event.detail.value;
    }

    hideSuccessMess(){
        this.savedSuccess=false;
    }

    hideErrorMess(){
        this.savedError=false;
    }


    handleSelect(event) {
        console.log(event.detail);
        let obj = JSON.parse(event.detail);
        this.BasicSetting[obj.name]= obj.value;      
        
        if(obj.name=='DateOnly' && obj.value==true){
            this.BasicSetting.DayOnly=false;
            this.BasicSetting.ShortDaywithDate=false;

            let checkbox=this.template.querySelectorAll('c-check-Box');
            for(let i=0;i<checkbox.length;i++){
                let name=checkbox[i].getName();     
                if(name==='DayOnly' || name==='ShortDaywithDate'){
                    checkbox[i].SetValue(false);
                }
            }
        }

        else if(obj.name=='DayOnly' && obj.value==true){
            this.BasicSetting.DateOnly=false;
            this.BasicSetting.ShortDaywithDate=false;

            let checkbox=this.template.querySelectorAll('c-check-Box');
            for(let i=0;i<checkbox.length;i++){
                let name=checkbox[i].getName();     
                if(name==='DateOnly' || name==='ShortDaywithDate'){
                    checkbox[i].SetValue(false);
                }
            }
        }

        else if(obj.name=='ShortDaywithDate' && obj.value==true){
            this.BasicSetting.DateOnly=false;
            this.BasicSetting.DayOnly=false;

            let checkbox=this.template.querySelectorAll('c-check-Box');
            for(let i=0;i<checkbox.length;i++){
                let name=checkbox[i].getName();     
                if(name==='DateOnly' || name==='DayOnly'){
                    checkbox[i].SetValue(false);
                }
            }
        }
    }
}