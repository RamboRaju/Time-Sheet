/* eslint-disable radix */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import { LightningElement, api, track} from 'lwc';
import addEntryRow  from '@salesforce/apex/ganttController.addEntryRow';
import deleteRow  from '@salesforce/apex/ganttController.deleteRow';

export default class TimeEntry extends LightningElement {

    @api header;
    @api basicsetting;
  
    @api subTotalRowKey = 1;
    @api subTotalRowKey1 = 2;
 
   // @track AllEntry;
    @track ProjectApi;
    @track ProjectLabel;
    @track TaskApi;
    @track TaskLabel;
    lebelhiden=true;
    @track localsetting;
    @track showMessage=false;
    @track messages;
    @track readOnly;
    @track hideTask=false;
    @track myArray = [];
    @track isPicklist;

    connectedCallback() {  
        console.log('********');
        if(this.basicsetting){         
            this.hideTask= this.basicsetting.HideTask;
            this.readOnly=this.basicsetting.readOnly;
            this.isPicklist = this.basicsetting.isPicklist;
            this.localsetting=this.basicsetting.constructor();

            for (let attr in this.basicsetting) {
                if (this.basicsetting.hasOwnProperty(attr) && attr!=='timeEntries'){
                    this.localsetting[attr] = this.basicsetting[attr];
                }
                if(this.basicsetting.hasOwnProperty(attr) && attr==='timeEntries'){
                    let localtimeEntries=[];
                    let timeEntries=this.basicsetting[attr];
                    for(let i=0;i<timeEntries.length;i++){
                        let TimeEntryRow=timeEntries[i];
                        let localTimeEntryRow=TimeEntryRow.constructor();
                        
                        for (let col in TimeEntryRow) {
                            if (TimeEntryRow.hasOwnProperty(col) && col!=='TimeEntries'){
                                localTimeEntryRow[col]=TimeEntryRow[col];
                            }
                            if (TimeEntryRow.hasOwnProperty(col) && col==='TimeEntries'){
                                let TimeEntries=TimeEntryRow[col];
                                let localTimeEntries=[];
                                for(let j=0;j<TimeEntries.length;j++){
                                    let dTimeEntry=TimeEntries[j];
                                    let localTimeEntry=dTimeEntry.constructor();
                                    for(let rr in dTimeEntry){
                                        if (dTimeEntry.hasOwnProperty(rr)){
                                            localTimeEntry[rr]=dTimeEntry[rr];
                                        }
                                    }
                                    localTimeEntries.push(localTimeEntry);
                                }
                                localTimeEntryRow.TimeEntries=localTimeEntries;
                            }
                        }
                        localtimeEntries.push(localTimeEntryRow);
                    }
                    this.localsetting.timeEntries=localtimeEntries;
                }
            } 
            console.log('***** the local file');
            console.log(JSON.stringify(this.localsetting));
            let localSet = this.localsetting.timeEntries;    
            this.timeEntryRowSumation(localSet);
           // this.AllEntry=this.basicsetting.timeEntries;
          
            this.ProjectApi=this.basicsetting.EntryProjectObject;
            this.ProjectLabel=this.basicsetting.EntryProjectObjectLabel;
            this.TaskApi=this.basicsetting.EntryTaskObject;
            this.TaskLabel=this.basicsetting.EntryTaskObjectLabel;        
        }
    }

    timeEntryRowSumation(localSet){
        this.myArray = [];
        for(let i=0; i<localSet.length;i++){
            let rowH = localSet[i].TimeEntries;
            for(let j = 0; j< rowH.length; j++){
                if(this.myArray.length === rowH.length){
                    this.myArray[j] = this.myArray[j] + rowH[j].Hours;
                }else{
                    this.myArray.push(rowH[j].Hours);
                }
                
            }
        }

        let detailObj=[];
        console.log('my Array '+this.myArray)
        detailObj=this.myArray;    
        const selectEvent = new CustomEvent('summarychange', {
            detail: detailObj
        });
        this.dispatchEvent(selectEvent);

    }

    handleSelectionChange(event) {

        const selection = event.target.getSelection();
        let index=event.target.getIndex();
        console.log(index);
        let fieldName=event.target.getFieldName();
        console.log('****'+fieldName);
        if(fieldName && selection!==undefined && index!==undefined){
            let allEntr=this.localsetting.timeEntries;
            let oneEntry;
            for(let i=0;i<allEntr.length;i++){
                if(allEntr[i].key===index){
                    oneEntry=allEntr[i]
                }
            }
            if(oneEntry && selection.length>0){
                oneEntry[fieldName]=selection[0].id;
            }else{
                oneEntry[fieldName]='';
            }

            if(fieldName==='ProjectId' && selection.length===0){
                oneEntry.TaskId='';
                let lookups=this.template.querySelectorAll('c-lookup');
                for(let i=0;i<lookups.length;i++){
                    let theFieldName=lookups[i].getFieldName();
                    let theTaskIndex=lookups[i].getIndex();
                    if(theFieldName==='TaskId' && index===theTaskIndex){
                        lookups[i].resetSelection();
                    }
                }               
            }
        }

        console.log(JSON.stringify(selection));
       
        console.log(JSON.stringify(this.localsetting.timeEntries));
        // TODO: do something with the lookup selection
    }
    hourChange(event){       
        let key=event.target.accessKey;
        console.log(key);       
        /** 
        const selectEvent = new CustomEvent('entrychange', {
            detail: JSON.stringify(key)
        });
      
        this.dispatchEvent(selectEvent);**/
        if(key!==undefined){
            let indexes=key.split('-');
            console.log(indexes);
            if(indexes.length>0){

                let allEntr=this.localsetting.timeEntries;
                let entryIndex=parseInt(indexes[0]);
                console.log(entryIndex);
                console.log(allEntr);
                let entry;
                for(let i=0;i<allEntr.length;i++){
                    if(allEntr[i].key===entryIndex){
                        entry=allEntr[i];
                    }
                }
                console.log('**** ');
                console.log(JSON.stringify(entry));
                if(entry){
                    let dEntry
                    let dTimeEntries=entry.TimeEntries;
                    for(let j=0;j<dTimeEntries.length;j++){
                        if(dTimeEntries[j].key===key){
                            dEntry=dTimeEntries[j];
                        }
                    }
                    if(dEntry){
                        dEntry.Hours=event.target.value;
                        console.log(JSON.stringify(dEntry));
                    }

                }
                             
            }
        }

    }
    cloneNewRow(newRow){
        let localEntery;
        localEntery = JSON.parse(JSON.stringify(newRow));
        return localEntery;
    }
    addEntry(){
        console.log(JSON.stringify(this.localsetting));
        addEntryRow({basicstr:JSON.stringify(this.localsetting)})
        .then(result => {
            let newRow = result;
            let myRow = this.cloneNewRow(result);
            this.localsetting.timeEntries.push(myRow);
        })
        .catch(error => {
            this.error = error;
        });
    }

    handlePicklistSeletion(event){
        let index=event.target.getIndex();
        const selection = event.target.getSelection();
        let fieldName=event.target.getFieldName();
        
        if(fieldName && selection!==undefined && index!==undefined){
            let allEntr=this.localsetting.timeEntries;
            let oneEntry;
            for(let i=0;i<allEntr.length;i++){
                if(allEntr[i].key===index){
                    oneEntry=allEntr[i]
                }
            }
            if(oneEntry && selection!==undefined && selection!=='' ){
                oneEntry[fieldName]=selection.id;
            }else{
                oneEntry[fieldName]='';
            }

            if(fieldName==='ProjectId' && selection!==undefined && selection!==''){
                oneEntry.TaskId='';
                let lookups=this.template.querySelectorAll('c-dep-picklist');
                for(let i=0;i<lookups.length;i++){
                    let theFieldName=lookups[i].getFieldName();
                    let theTaskIndex=lookups[i].getIndex();
                    if(theFieldName==='TaskId' && index===theTaskIndex){
                        lookups[i].resetSelection();
                    }
                }               
            }
        }

        // console.log(JSON.stringify(selection));
        // console.log(JSON.stringify(this.localsetting.timeEntries));
        
    }

    delEntry(event){
        let currentIndex=event.target.alternativeText;
        console.log('*****');
        console.log(event.target.alternativeText);
        let allEntr=this.localsetting.timeEntries;
       // let index=0;
        let newEntry=[];
        let deletedRow;
        for(let i=0;i<allEntr.length;i++){
            if(allEntr[i].key===currentIndex){
                deletedRow=allEntr[i];
            }else{
                newEntry.push(allEntr[i]);
            }
        }
        this.localsetting.timeEntries=newEntry;
       // console.log(index);
        //let deletedRow= allEntr.slice(index,index+1);
        console.log(JSON.stringify(deletedRow));  
        deleteRow({oneRow:JSON.stringify(deletedRow)})
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            this.error = error;
        });
    }
  
    @api 
    baseset(value) {  
        console.log('inside baseset'); 
        console.log(value); 
        if(value){     
            this.basicsetting=value;     
            this.hideTask= this.basicsetting.HideTask;
            this.readOnly=this.basicsetting.readOnly; 
            this.isPicklist = this.basicsetting.isPicklist 
            this.localsetting=this.basicsetting.constructor();
            for (let attr in this.basicsetting) {
                if (this.basicsetting.hasOwnProperty(attr) && attr!=='timeEntries'){
                    this.localsetting[attr] = this.basicsetting[attr];
                }
                if(this.basicsetting.hasOwnProperty(attr) && attr==='timeEntries'){
                    let localtimeEntries=[];
                    let timeEntries=this.basicsetting[attr];
                    for(let i=0;i<timeEntries.length;i++){
                        let TimeEntryRow=timeEntries[i];
                        let localTimeEntryRow=TimeEntryRow.constructor();
                        
                        for (let col in TimeEntryRow) {
                            if (TimeEntryRow.hasOwnProperty(col) && col!=='TimeEntries'){
                                localTimeEntryRow[col]=TimeEntryRow[col];
                            }
                            if (TimeEntryRow.hasOwnProperty(col) && col==='TimeEntries'){
                                let TimeEntries=TimeEntryRow[col];
                                let localTimeEntries=[];
                                for(let j=0;j<TimeEntries.length;j++){
                                    let dTimeEntry=TimeEntries[j];
                                    let localTimeEntry=dTimeEntry.constructor();
                                    for(let rr in dTimeEntry){
                                        if (dTimeEntry.hasOwnProperty(rr)){
                                            localTimeEntry[rr]=dTimeEntry[rr];
                                        }
                                    }
                                    localTimeEntries.push(localTimeEntry);
                                }
                                localTimeEntryRow.TimeEntries=localTimeEntries;
                            }
                        }
                        localtimeEntries.push(localTimeEntryRow);
                    }
                    this.localsetting.timeEntries=localtimeEntries;
                }
            } 
        
            this.ProjectApi=this.basicsetting.EntryProjectObject;
            this.ProjectLabel=this.basicsetting.EntryProjectObjectLabel;
            this.TaskApi=this.basicsetting.EntryTaskObject;
            this.TaskLabel=this.basicsetting.EntryTaskObjectLabel;   
            
            if(this.basicsetting.reset===false){
                let lookups;
                if(!this.isPicklist){
                    lookups=this.template.querySelectorAll('c-lookup');
                }else{
                    lookups=this.template.querySelectorAll('c-dep-picklist');
                }
                
                for(let i=0;i<lookups.length;i++){
                    lookups[i].resetSelection();
                }       
            }else{   
                        
                let lookups;
                if(!this.isPicklist){
                    lookups=this.template.querySelectorAll('c-lookup');
                }else{
                    
                    lookups=this.template.querySelectorAll('c-dep-picklist');
                }
                for(let i=0;i<lookups.length;i++){
                    let key=lookups[i].getIndex();                  
                    let selectedItem = this.localsetting.timeEntries.filter(
                        result => result.key === key
                    );
                    let fieldName=lookups[i].getFieldName();
                    if(fieldName==='ProjectId'){
                      
                        lookups[i].setSelection(selectedItem[0].ProjectId);
                    }
                    else{
                        
                        lookups[i].setSelection(selectedItem[0].TaskId);
                    }
                
                }     
            }
        }
    }

    save(){    
        console.log('******* in save');
        this.messages=[];
        this.showMessage=false;
        let TaskRequired=this.localsetting.TaskRequired;
        let allentry=this.localsetting.timeEntries;
        
        if(allentry.length>0){
            for(let i=0;i<allentry.length;i++){
                let theRow=allentry[i];
                console.log(theRow);
                if(theRow.ProjectId===undefined || theRow.ProjectId===''){
                    this.messages.push('Project is Required on Row-'+(i+1));   
                    this.showMessage=true;              
                }
                if(TaskRequired===true && (theRow.TaskId==='' || theRow.TaskId===undefined)){
                    this.messages.push('Task is Required on Row-'+(i+1));
                    this.showMessage=true;
                }
            }
        }
        console.log(this.messages);
        if(this.showMessage===false){
            let detailObj={};
            detailObj.timeEntries=this.localsetting.timeEntries;
            detailObj.button='SAVE';
            const selectEvent = new CustomEvent('entrychange', {
                detail: detailObj
            });
            this.dispatchEvent(selectEvent);
        }
    }

    closemessagebox(){
        this.showMessage=false;
    }

    cancel(){
        let detailObj={};
       
        detailObj.button='CANCEL';
        const selectEvent = new CustomEvent('entrychange', {
            detail: detailObj
        });
        this.dispatchEvent(selectEvent);
    }

    submit(){    
        this.messages=[];
        this.showMessage=false;
        let TaskRequired=this.localsetting.TaskRequired;
        let allentry=this.localsetting.timeEntries;
        
        if(allentry.length>0){
            for(let i=0;i<allentry.length;i++){
                let theRow=allentry[i];
                if(theRow.ProjectId===undefined || theRow.ProjectId===''){
                    this.messages.push('Project is Required on Row-'+(i+1));   
                    this.showMessage=true;              
                }
                if(TaskRequired===true && (theRow.TaskId==='' || theRow.TaskId===undefined)){
                    this.messages.push('Task is Required on Row-'+(i+1));
                    this.showMessage=true;
                }
            }
        }
        console.log(this.messages);
        if(this.showMessage===false){
            let detailObj={};
            detailObj.timeEntries=this.localsetting.timeEntries;
            detailObj.button='SUBMIT';
            const selectEvent = new CustomEvent('entrychange', {
                detail: detailObj
            });
            this.dispatchEvent(selectEvent);
        }
    }
}