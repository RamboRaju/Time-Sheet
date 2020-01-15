public virtual class BaseSettingService {

    public TimeSheet_Setting__c BaseSetting;
    
    public virtual  void fetchRecord(){
        set<string> fields=Utility.getFields('TimeSheet_Setting__c');
        string query=Utility.createQuery(fields,'TimeSheet_Setting__c');
        
        list<TimeSheet_Setting__c> BaseSettinglist=database.query(query);
        if(BaseSettinglist.size()>0){
            BaseSetting=BaseSettinglist[0];
        }
    }
    
    public string saveBasicSetting(string BasicSetting){
        string result='';
        
        try{
            system.debug('****************BasicSetting'+BasicSetting);
            Setting sst=(Setting)JSON.deserialize(BasicSetting, Setting.class);
            system.debug('*****************sst'+sst);
            
            if(sst!=null){
                
                TimeSheet_Setting__c BaseSetting=new TimeSheet_Setting__c();
                
                if(sst.recordId!=null && sst.recordId!='')
                    BaseSetting.Id= sst.recordId;
                
                BaseSetting.Custom_Hoilday__c=sst.CustomHoilday;         
                BaseSetting.Custom_Leave__c=sst.CustomLeave;
                BaseSetting.Default_Interval__c=sst.DefaultInterval;           
                BaseSetting.Disable_Approval_Process__c=sst.DisableApprovalProcess;
                BaseSetting.Disable_Overlap__c=sst.DisableOverlap;
                BaseSetting.EmployeeField__c=sst.EmployeeField;
                BaseSetting.Entry_Project_Field__c=sst.EntryProjectField;
                BaseSetting.Entry_Task_Field__c=sst.EntryTaskField;
                BaseSetting.Hide_Task__c=sst.HideTask;
                BaseSetting.Holiday_Check__c=sst.HolidayCheck;
                BaseSetting.Leave_Check__c= sst.LeaveCheck;   
                BaseSetting.Project_Field__c=sst.ProjectField;
                BaseSetting.Show_Weekend__c=sst.ShowWeekend;
                BaseSetting.Task_Required__c=sst.TaskRequired;
                BaseSetting.Week_Start_Day__c=sst.WeekStartDay;
                
                BaseSetting.Date_Only__c=sst.DateOnly;
                BaseSetting.Day_Only__c=sst.DayOnly;
                BaseSetting.Short_Day_with_Date__c=sst.ShortDaywithDate;
                
                if(BaseSetting.Id!=null)
                    update BaseSetting;
                else 
                    insert BaseSetting;
            }
        }catch(exception e){
            result=e.getmessage();
        }
        
        return result;
    }
    
    public virtual Setting getTimeSheetSetting(){
       
        Setting sst=new Setting();
        
            
        fetchRecord();
        
        if(BaseSetting!=null){
            sst.recordId=BaseSetting.Id;
            sst.CustomHoilday=BaseSetting.Custom_Hoilday__c;         
            sst.CustomLeave=BaseSetting.Custom_Leave__c;
            sst.DefaultInterval=BaseSetting.Default_Interval__c;           
            sst.DisableApprovalProcess=BaseSetting.Disable_Approval_Process__c;
            sst.DisableOverlap=BaseSetting.Disable_Overlap__c;
            sst.EmployeeField=BaseSetting.EmployeeField__c;
            sst.EntryProjectField=BaseSetting.Entry_Project_Field__c;
            sst.EntryTaskField=BaseSetting.Entry_Task_Field__c;
            sst.HideTask=BaseSetting.Hide_Task__c;
            sst.HolidayCheck=BaseSetting.Holiday_Check__c;
            sst.LeaveCheck=BaseSetting.Leave_Check__c;   
            sst.ProjectField=BaseSetting.Project_Field__c;
            sst.ShowWeekend=BaseSetting.Show_Weekend__c;
            sst.TaskRequired=BaseSetting.Task_Required__c;
            sst.WeekStartDay=BaseSetting.Week_Start_Day__c;
            sst.DateOnly=BaseSetting.Date_Only__c;
            sst.DayOnly=BaseSetting.Day_Only__c;
            sst.ShortDaywithDate=BaseSetting.Short_Day_with_Date__c;
        }else{
           
            //SET DEFAULT VALUE
     
            sst.CustomHoilday=false;         
            sst.CustomLeave=false;
            sst.DefaultInterval='WEEK';           
            sst.DisableApprovalProcess=false;
            sst.DisableOverlap=true;
            sst.EmployeeField='Employee__c';
            sst.EntryProjectField='Assignment__c';
            sst.EntryTaskField='Task__c';
            sst.HideTask=false;
            sst.HolidayCheck=false;
            sst.LeaveCheck=true;   
            sst.ProjectField='Assignment__c';
            sst.ShowWeekend=true;
            sst.TaskRequired=true;
            sst.WeekStartDay='SUNDAY'; 
            sst.DateOnly=true;
            sst.DayOnly=false;
            sst.ShortDaywithDate=false;
        }
        
        return sst;
    }
    
    public class Setting{    
        @auraEnabled
        public string recordId;   
        @auraEnabled
        public boolean CustomHoilday;
        @auraEnabled
        public boolean CustomLeave;
        @auraEnabled
        public string DefaultInterval;
        @auraEnabled
        public list<string> DefaultIntervals;
        @auraEnabled
        public boolean DisableApprovalProcess;
        @auraEnabled
        public boolean DisableOverlap;
        @auraEnabled
        public string EmployeeField;
        @auraEnabled
        public string EntryProjectField;
        @auraEnabled
        public string EntryTaskField;
        @auraEnabled
        public boolean HideTask;
        @auraEnabled
        public boolean HolidayCheck;
        @auraEnabled
        public boolean LeaveCheck;   
        @auraEnabled
        public string ProjectField;
        @auraEnabled
        public boolean ShowWeekend;
        @auraEnabled
        public boolean TaskRequired;
        @auraEnabled
        public string WeekStartDay;
        
        @auraEnabled
        public boolean DateOnly;
        @auraEnabled
        public boolean DayOnly;
        @auraEnabled
        public boolean ShortDaywithDate;
        
        @auraEnabled
        public boolean trial;
                
        public setting(){
            DefaultIntervals=new list<string>();
            DefaultIntervals.add('WEEK');
            DefaultIntervals.add('MONTH');
            DefaultIntervals.add('DAY');
            
            trial=true;
        }
    }
}