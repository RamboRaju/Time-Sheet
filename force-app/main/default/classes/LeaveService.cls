public virtual class LeaveService{
    
    public Leave_Setting__c LeaveSetting;
    
    public virtual  void fetchRecord(){
        set<string> fields=Utility.getFields('Leave_Setting__c');
        
        string query=Utility.createQuery(fields,'Leave_Setting__c ');
        
        list<Leave_Setting__c > LeaveSettinglist=database.query(query);
        if(LeaveSettinglist.size()>0){
            LeaveSetting=LeaveSettinglist[0];
        }
    }
    
    public virtual Setting getLeaveSetting(){
           
        Setting sst=new Setting();                  
        fetchRecord();
        
        if(LeaveSetting!=null){
            
        }else{
            sst.ObjectName='';
            sst.ActivityDateField='';
            sst.EmployeeField='';
        }
        
        return sst;
    }
    
    public class Setting{ 
        @auraEnabled
        public string ActivityDateField;
        @auraEnabled
        public string EmployeeField;
        @auraEnabled
        public string ObjectName;
    }
}