public virtual class HolidayService{
    
    public Holiday_Setting__c HolidaySetting;
     
    public virtual  void fetchRecord(){
        set<string> fields=Utility.getFields('Holiday_Setting__c');
        string query=Utility.createQuery(fields,'Holiday_Setting__c');
        
        list<Holiday_Setting__c> HolidaySettinglist=database.query(query);
        if(HolidaySettinglist.size()>0){
            HolidaySetting=HolidaySettinglist[0];
        }
    }
    
    public virtual Setting getHolidaySetting(){
           
        Setting sst=new Setting();                  
        fetchRecord();
        if(HolidaySetting!=null){
            
        }else{
            sst.ObjectName='';
            sst.ActivityDateField='';
        }
        
        return sst;
    }
    
    public class Setting{ 
        @auraEnabled
        public string ObjectName;
        @auraEnabled
        public string ActivityDateField;
    }
}