/* eslint-disable no-console */
import { LightningElement, track ,api} from 'lwc';

export default class UserSetup extends LightningElement {
    @api basesetting;

    @track ShowWeekend;
    @track TaskRequired;
    @track HideTask;
    @track DateOnly;
    @track DayOnly;
    @track ShortDaywithDate;

    @track openmodel = false;
    openmodal() {
        this.openmodel = true;
        console.log(this.ShowWeekend);
        console.log(this.TaskRequired);
        console.log(this.HideTask);
    }
    closeModal() {
        this.openmodel = false
    } 

    connectedCallback() {  
        console.log('*********************');
        console.log(this.basesetting);
        if(this.basesetting){
            this.ShowWeekend=this.basesetting.ShowWeekend;
            this.TaskRequired=this.basesetting.TaskRequired;
            this.HideTask=this.basesetting.HideTask;
            this.DateOnly=this.basesetting.DateOnly;
            this.DayOnly=this.basesetting.DayOnly;
            this.ShortDaywithDate=this.basesetting.ShortDaywithDate;
        }
    }

    saveMethod() {
        // eslint-disable-next-line no-alert
        let theDetail={};
        theDetail.ShowWeekend=this.ShowWeekend;
        theDetail.TaskRequired=this.TaskRequired;
        theDetail.HideTask=this.HideTask;
        theDetail.DateOnly=this.DateOnly;
        theDetail.DayOnly=this.DayOnly;
        theDetail.ShortDaywithDate=this.ShortDaywithDate;
        console.log(theDetail);
        const selectEvent = new CustomEvent('save', {
            detail: JSON.stringify(theDetail)
        });
      
        this.dispatchEvent(selectEvent);

        this.closeModal();

    }

    handleSelect(event){
        console.log(event.detail);
        let obj = JSON.parse(event.detail);
        if(obj.name==='ShowWeekend'){
            this.ShowWeekend=obj.value;
        }

        if(obj.name==='TaskRequired'){
            this.TaskRequired=obj.value;
            if( this.HideTask===true && this.TaskRequired===true){
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='TaskRequired'){
                        checkbox[i].SetValue(false);
                        this.TaskRequired=false;
                        break;
                    }
                }
            }
        }

        if(obj.name==='DateOnly'){
            this.DateOnly=obj.value;

            if( this.DateOnly===true){
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='DayOnly'){
                        checkbox[i].SetValue(false);
                        this.DayOnly=false;
                    }
                    if(name==='ShortDaywithDate'){
                        checkbox[i].SetValue(false);
                        this.ShortDaywithDate=false;
                    }
                }
            }

        }

        if(obj.name==='DayOnly'){
            this.DayOnly=obj.value;

            if( this.DayOnly===true){
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='DateOnly'){
                        checkbox[i].SetValue(false);
                        this.DateOnly=false;
                    }
                    if(name==='ShortDaywithDate'){
                        checkbox[i].SetValue(false);
                        this.ShortDaywithDate=false;
                    }
                }
            }
        }

        if(obj.name==='ShortDaywithDate'){
            this.ShortDaywithDate=obj.value;
        
            if( this.ShortDaywithDate===true){
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='DateOnly'){
                        checkbox[i].SetValue(false);
                        this.DateOnly=false;
                    }
                    if(name==='DayOnly'){
                        checkbox[i].SetValue(false);
                        this.DayOnly=false;
                    }
                }
            }
        }

        if(obj.name==='HideTask'){
            this.HideTask=obj.value;
            if( this.HideTask===true){
                let checkbox=this.template.querySelectorAll('c-check-Box');
                for(let i=0;i<checkbox.length;i++){
                    let name=checkbox[i].getName();     
                    if(name==='TaskRequired'){
                        checkbox[i].SetValue(false);
                        this.TaskRequired=false;
                        break;
                    }
                }
            }
                 
        }

        //this.BasicSetting[obj.name]= obj.value; 
    }
}