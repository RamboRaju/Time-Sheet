public virtual class TimeSheetService extends BaseSettingService{
    
    public HolidayService HolidaySer;
    public LeaveService   LeaveSer;
    
    public TimeSheetService(){
        HolidaySer=new HolidayService();
        LeaveSer= new LeaveService();   
    }
    
    public void deleteRow(string oneRow){
        
        TimeEntryRow theRow=(TimeEntryRow)JSON.deserialize(oneRow, TimeEntryRow.class);
        list<Time_Entry__c> Entries=new list<Time_Entry__c>();
        for(TimeEntry te:theRow.TimeEntries){
            Time_Entry__c theRecord=new Time_Entry__c();
            if(te.RecordId!=null && te.RecordId!=''){
                theRecord.id=te.RecordId;
                Entries.add(theRecord);
            }
        }
        
        if(Entries.size()>0)
            delete Entries;
    }
    
    public TimeSheetSetting getSetting(){
        TimeSheetSetting Tss=new TimeSheetSetting();
        Tss.BaseSetting=getTimeSheetSetting();
        Tss.LeaveSetting=LeaveSer.getLeaveSetting();
        Tss.HolidaySetting=HolidaySer.getHolidaySetting();
        return Tss;
    }
    
    public string SaveBasic(string BasicSetting){
        return saveBasicSetting(BasicSetting);
    }
    
    public Response SaveTimeSheet(string finalResponse,string mode){
        Response rep=new Response();
        Result rs=(Result)JSON.deserialize(finalResponse, Result.class);
        if(rs!=null){
            TimeSheet__c ts=new TimeSheet__c();
            ts.id=rs.RecordId;
                       
            if(rs.RecordId!=null){
                boolean isDateChanged=false;
                TimeSheet__c timesheet=[select id,Start_Date__c from TimeSheet__c where id=:rs.RecordId];
                if(timesheet.Start_Date__c!=rs.StartDate)
                    isDateChanged=true;
                
                if(isDateChanged){
                    list<Time_Entry__c>  allEntryDel=[select id from time_Entry__c where TimeSheet__c=:rs.RecordId];
                    delete allEntryDel;
                }
            }
        
            ts.id=rs.RecordId;
            ts.Name=rs.Name;
            ts.Employee__c=rs.SelectedEmp;
            ts.End_Date__c=rs.EndDate;
            ts.Hide_Task__c=rs.HideTask;
            ts.Interval__c=rs.DateLabel;
        
            ts.Show_Weekend__c=rs.ShowWeekend;
            ts.Start_Date__c=rs.StartDate;
            ts.Task_Required__c=rs.TaskRequired;
            ts.Week_Start_Day__c=rs.WeekStartDay;

            ts.Date_Only__c=rs.DateOnly;
            ts.Day_Only__c=rs.DayOnly;
            ts.Short_Day_with_Date__c=rs.ShortDaywithDate;
                    
            upsert ts;
                  
            rep.RecordId=ts.Id;            
            
            if(rs.TimeEntries!=null && rs.TimeEntries.size()>0){
                list<Time_Entry__c> allTimeEntry=new list<Time_Entry__c>();
                for(integer i=0;i<rs.TimeEntries.size();i++){
                    TimeEntryRow ter=rs.TimeEntries[i];
                    string ProjectId=ter.ProjectId;
                    string TaskId=ter.TaskId;
                    integer key=ter.key;
                    if(ProjectId!=null && ProjectId.trim()!='' && (TaskId!=null || rs.TaskRequired==false)){
                        for(integer j=0;j<ter.TimeEntries.size();j++){
                            TimeEntry te=ter.TimeEntries[j];
                           
                            Time_Entry__c teDm=new Time_Entry__c();
                            tedm.id=te.RecordId;
                            if(te.RecordId==null)
                                teDm.TimeSheet__c=ts.id;
                           
                            teDm.Hours__c=te.Hours;
                            teDm.Is_Show__c=te.isShow;
                            teDm.Date__c=te.EntryDate;
                            teDm.Hours__c=te.hours;
                            teDm.Assignment__c=ProjectId;
                            if(TaskId!=null && TaskId.trim()!='')
                                teDm.Task__c=TaskId;
                            else{
                                teDm.Task__c=null;
                            }
                            teDm.Row__c=key;
                            allTimeEntry.add(teDm);
                        }
                    }else{
                    
                    }
                }
                
                upsert allTimeEntry;
            }
            
        }
        
        rep.Status=true;
 
        if(mode=='SUBMIT'){
            SubmitForAproval(rep);
        }
        
      
        return rep;
    }
    
    public void  SubmitForAproval(Response rep){
        try{
            Approval.ProcessSubmitRequest req =new Approval.ProcessSubmitRequest();
            req.setComments('Submitting request for approval.');
            req.setObjectId(rep.RecordId);
            req.setSubmitterId(UserInfo.getUserId());
            // req.setProcessDefinitionNameOrId('PTO_Request_Process');
            // req.setSkipEntryCriteria(true);
            Approval.ProcessResult result = Approval.process(req);
            
            rep.status=result.isSuccess();
            if(rep.status!=true){
                for(Database.Error er:result.getErrors())
                    rep.Messages.add(er.getMessage());
            }
        }catch(exception e){
            if(e.getDmlType(0)==StatusCode.NO_APPLICABLE_PROCESS)
                rep.Messages.add('No applicable approval process was found.');
            else
            rep.Messages.add(e.getMessage());
            rep.Status=false;
        }
    }
    
    public class Response{
        @auraEnabled
        public string RecordId;
        @auraEnabled
        public boolean status;
         @auraEnabled
        public list<string> Messages;
        
        public Response (){
            Messages=new list<string>();
        }       
    }
    
    //ADD ENTRY ROW
    //USED BY ENTRY SCREEN
    
    public TimeEntryRow addEntryRow(string basicstr){
        Result rs=(Result)JSON.deserialize(basicstr, Result.class);
         
        TimeEntryRow ter=new TimeEntryRow();
        
        if(rs!=null){
            integer max=0;
            
            for(integer i=0;i<rs.timeEntries.size();i++){
                if(rs.timeEntries[i].key>max)
                    max=rs.timeEntries[i].key;
            }
            max++;
            list<TimeEntry>   TimeEntries=new list<TimeEntry>();
            for(integer i=0;i<rs.StartDate.daysBetween(rs.EndDate);i++){
                TimeEntry te=new TimeEntry();
                te.EntryDate=rs.StartDate.addDays(i);
                te.Hours=0;
                te.key=max+'-'+i;
                TimeEntries.add(te);
            }
           
            ter.ProjectId='';
            ter.TaskId='';
            ter.TimeEntries=TimeEntries;
            ter.key=max;          
        }
        
        return ter;
    }
    
    public class TimeSheetSetting{    
        @auraEnabled
        public Setting  BaseSetting;      
        @auraEnabled
        public LeaveService.Setting LeaveSetting;        
        @auraEnabled
        public HolidayService.Setting HolidaySetting;
    }   

    //GET VALID DATE WHEN USER CHANGE THE DATE
    
    public DateRanges getValidDate(Date CurrentDate,string Interval,string WeekStartDay){
        date validDate=CurrentDate;
        DateRanges dr=new DateRanges();
        dr.StartDate=validDate;
        if(Interval.tolowercase()=='week'){          
            date weekStart=Utility.StartOfWeek(WeekStartDay,CurrentDate);
            dr.StartDate=weekStart;
            dr.EndDate=weekStart.adddays(7);    
        }
        return dr;
    }
    
     // return duplicate time sheet 
    public Result getDuplicateTimeSheet(string baseSettingStr){
        Result rs1 = new Result();
        Result rs=(Result)JSON.deserialize(baseSettingStr, Result.class);
        System.debug('Result==== '+rs.StartDate);
        List<TimeSheet__c> timeSheetList = new List<TimeSheet__c>();
        timeSheetList = [Select id, name,Start_Date__c,End_Date__c from TimeSheet__c where Start_Date__c  <=:rs.StartDate And End_Date__c  >= :rs.StartDate limit 1];
        System.debug('timeSheetList '+timeSheetList);
        if(timeSheetList.size() > 0){
            rs1 = getBasicSetting(timeSheetList[0].id);
            System.debug('inside if block '+rs1);
            if(getApprovalStatus(timeSheetList[0].id).size() > 1){
                 rs1.readOnly = true;
            }
            return rs1;
        }
        
        return null;
    }
    
    public Result getUpdateBasicSetting(string baseSettingStr){
        Result rs=(Result)JSON.deserialize(baseSettingStr, Result.class);
         if(getDuplicateTimeSheet(baseSettingStr) != null ){
            return getDuplicateTimeSheet(baseSettingStr);
        }
        if(rs!=null){
            rs.reset=false;
            DateRanges  dr=getValidDate(rs.StartDate,rs.DateLabel,rs.WeekStartDay);
            rs.StartDate=dr.StartDate;
            rs.EndDate=dr.EndDate;
            if(rs.RecordId!=null){
                TimeSheet__c ts=new TimeSheet__c();
                ts.id=rs.RecordId;
                ts.Hide_Task__c=rs.HideTask;
                ts.Show_Weekend__c=rs.showweekend;
                ts.Task_Required__c=rs.TaskRequired;               
                ts.Date_Only__c=rs.DateOnly;
                ts.Day_Only__c=rs.DayOnly;
                ts.Short_Day_with_Date__c=rs.ShortDaywithDate;
                
                update ts;
                    
                rs.timeEntries=new list<TimeEntryRow>();
                rs.timeEntries=getOldEntrySet(rs.RecordId,rs.hideTask,rs.StartDate);
                if(rs.timeEntries.size()>0)
                    rs.reset=true;             
            }
            
            if(rs.RecordId==null || rs.timeEntries.size()==0)
                rs.timeEntries=CreateDefaultEntry(rs.StartDate,rs.EndDate);     
           
            rs.Header=createHeader(rs,rs.StartDate,rs.endDate,rs.DateLabel,rs.readOnly);        
      
        }
        return rs;
    }
     // open in edit mode after submit
    public List<String> getApprovalStatus(string recordId){
        Boolean approvalProcessStatus = false;
        List<String> myList = new List<String>();
        List<ProcessInstance> processInstanceList =[SELECT Id, Status, TargetObject.Name FROM ProcessInstance WHERE TargetObjectId=:recordId];
        if(processInstanceList.size() > 0){
            for(ProcessInstance pi : processInstanceList){
                if(pi.Status== 'Submitted' || pi.Status== 'Pending' || pi.Status== 'Approved'){
                    myList.add('true');
                    myList.add(pi.Status);
                    approvalProcessStatus = true;
                }
        	}
        }
        
        return myList;

    }
    //GET THE BASIC SETTING
    
    public Result getBasicSetting(string recordId){
        System.debug('Hello i am in get basic setting');
        Result rs=new Result();
        
        Setting  BaseSetting=getTimeSheetSetting();
        
        //GET START AND END WEEK RANGE 
        rs.DateLabel=BaseSetting.DefaultInterval;
        
        if(BaseSetting.DefaultInterval=='WEEK'){          
            date weekStart=Utility.StartOfWeek(BaseSetting.WeekStartDay,date.today());
            rs.StartDate=weekStart;
            rs.EndDate=weekStart.adddays(7);    
        }
        
        //if recordidnull 
        System.debug('recordId '+recordId);
        if(recordId==null){
            List<TimeSheet__c> timeSheetList = new List<TimeSheet__c>();
            System.debug('rs.StartDate '+rs.StartDate);
            timeSheetList = [Select id, name,Start_Date__c,End_Date__c from TimeSheet__c where Start_Date__c=:rs.StartDate And End_Date__c  >= :rs.EndDate limit 1];
            System.debug('timeSheetList '+timeSheetList);
            if(timeSheetList.size() > 0){
                rs.Recordid = timeSheetList[0].id;
            }   
        }else{
             rs.Recordid=recordId;
        }
        
        System.debug('rs.Recordid '+rs.Recordid);
        TimeSheet__c timeSheet=new TimeSheet__c();
        
       // rs.Recordid=recordId;
        rs.Name='';
        rs.readOnly=false;
        if(recordId!=null && recordId!=''){
            List<String> myList = new List<String>();
            myList = getApprovalStatus(recordId);
            if(myList.size() > 1){
                rs.readOnly = true;
                rs.ApprovalMessage = 'This record is currently in an approval process. A record can be in only one approval process at a time, Status : ' +myList.get(1);
            }
        }
        
        
        //rs.readOnly=false;
        
        if(rs.Recordid!=null && rs.Recordid!=''){
            String tId = rs.Recordid;
            System.debug('tId+++ '+tId);
            set<string> fields=Utility.getFields('TimeSheet__c');
            string query=Utility.createQuery(fields,'TimeSheet__c');
            query+=' where id=:tId';
            timeSheet=database.query(query);  
            System.debug('timeSheet+++ '+timeSheet);
        }
        
       
        //THE BASIC SETTINGS
        rs.HideTask=BaseSetting.HideTask;
        rs.showweekend=BaseSetting.ShowWeekend;
        rs.TaskRequired=BaseSetting.TaskRequired;
        rs.WeekStartDay=BaseSetting.WeekStartDay;
        
        rs.DateOnly=BaseSetting.DateOnly;
        rs.DayOnly=BaseSetting.DayOnly;
        rs.ShortDaywithDate=BaseSetting.ShortDaywithDate;
        
        //SELECTED EMPLOYEE      
        rs.SelectedEmp=UserInfo.getUserId();
        
        //IF EDIT THEN GET DATA FROM RECORD
        
        if(rs.Recordid!=null && rs.Recordid!=''){
            rs.StartDate=timeSheet.Start_Date__c;
            rs.EndDate=timeSheet.End_Date__c;
            rs.SelectedEmp=(string)timeSheet.get(BaseSetting.EmployeeField);
            rs.DateLabel=(string)timeSheet.get('Interval__c');
            
            //THE BASIC SETTINGS
            rs.HideTask=(Boolean)timeSheet.get('Hide_Task__c');
            rs.showweekend=(Boolean)timeSheet.get('Show_Weekend__c');
            rs.TaskRequired=(Boolean)timeSheet.get('Task_Required__c');
            
            rs.Name=(string)timeSheet.get('Name');
            
            rs.DateOnly=(Boolean)timeSheet.get('Date_Only__c');
            rs.DayOnly=(Boolean)timeSheet.get('Day_Only__c');
            rs.ShortDaywithDate=(Boolean)timeSheet.get('Short_Day_with_Date__c');
        
        }
              
        //GET THE ENTRIES
        list<TimeEntryRow> allEntries=new list<TimeEntryRow>();
        
        if(rs.Recordid!=null && rs.Recordid!=''){
            allEntries=getOldEntry(rs.Recordid,rs.HideTask,rs.readOnly);               
        }
        
        //SET DEFAULT ENTRY
        else{                   
            allEntries=CreateDefaultEntry(rs.StartDate,rs.EndDate);           
        }
       
        rs.timeEntries=allEntries;
       
        //THE EMPLOYEE FIELD 
        rs.EmployeeField=BaseSetting.EmployeeField;
        
        //THE SELECTED ENTRY FIELD       
        rs.EntryProjectField=BaseSetting.EntryProjectField;
        
        //THE SELECTED TASK FIELD
        
        rs.EntryTaskField=BaseSetting.EntryTaskField;
        
        //GET SOBJECT FOR THE REFERENCE LOOKUP ON THE CLIENT SITE
      		rs.EntryProjectObject = 'Assignment__c';
            rs.EntryProjectObjectLabel = 'Assignment';
            rs.EntryTaskObject = 'Task__c';
            rs.EntryTaskObjectLabel = 'Task';
            rs.EmployeeFieldObject = 'User';
            rs.EmployeeFieldObjectLabel = 'User';
        
        //CREATE THE HEADERS
        list<OneCol> Headers=new list<OneCol>();    
        Headers=createHeader(rs,rs.StartDate,rs.endDate,rs.DateLabel,rs.readOnly);        
        rs.Header=Headers;
        
        System.debug('Get start date from basic setting '+rs.StartDate);
       // if(getDuplicateTimeSheet(JSON.serialize(rs)) != null ){
            //return getDuplicateTimeSheet(JSON.serialize(rs));
       // }
     
        return rs;
    }
    
    //GET CREATED ENTRIES
    public list<TimeEntryRow> getOldEntry(string RecordId,boolean isTask,boolean readOnly){
        
        list<TimeEntryRow>  allRows=new list<TimeEntryRow> ();
        list<Time_Entry__c> TEs=[select id,Date__c,Hours__c,Is_Show__c,Project__c,Assignment__c,Task__c,TimeSheet__c,Row__c
        from Time_Entry__c where TimeSheet__c=:RecordId order by Row__c,Date__c asc];
        
        map<integer,list<Time_Entry__c>> keyEntryMap=new map<integer,list<Time_Entry__c>>();
        map<integer,string> keyProjectId=new map<integer,string>();
        map<integer,string> keyTaskId=new map<integer,string>();
        
        for(Time_Entry__c te:TEs){
            string ProjectId=te.Assignment__c;
            string TaskId=te.Task__c!=null?te.Task__c:null;
                       
            integer key=integer.valueof(te.Row__c);
            
            keyProjectId.put(key,ProjectId);
            keyTaskId.put(key,TaskId);
            
            if(!keyEntryMap.containskey(key)){
                keyEntryMap.put(key,new list<Time_Entry__c>());
            }
            keyEntryMap.get(key).add(te);
        }
        
    
        for(integer pStr:keyEntryMap.keyset()){
            string ProjectId=keyProjectId.get(pStr);
            string taskId=keyTaskId.get(pStr);
            
            TimeEntryRow ter=new TimeEntryRow();
            ter.key=pStr;
            ter.ProjectId=ProjectId;
            ter.TaskId=TaskId;
            
            if(readOnly)
            	ter.readOnly=true;
            //ter.isTask
            
            list<TimeEntry> TimeEntries=new list<TimeEntry> ();
            integer subCount=0;
            for(Time_Entry__c te:keyEntryMap.get(pStr)){
                
                TimeEntry teN=new TimeEntry();
                teN.RecordId=te.id;
                teN.key=pStr+'-'+subcount;
                teN.EntryDate=te.date__c;
                teN.Hours=te.Hours__c;
                teN.isShow=te.Is_Show__c;
                TimeEntries.add(teN);
                subCount++;
            }
            
            ter.TimeEntries=TimeEntries;
            allRows.add(ter);
        }
        return allRows;
    }
    
     
    //GET CREATED ENTRIES
    public list<TimeEntryRow> getOldEntrySet(string RecordId,boolean isTask,date currentDate){
        
        list<TimeEntryRow>  allRows=new list<TimeEntryRow> ();
        list<Time_Entry__c> TEs=[select id,Date__c,Hours__c,Is_Show__c,Project__c,Assignment__c,Task__c,TimeSheet__c,Row__c
        from Time_Entry__c where TimeSheet__c=:RecordId  and TimeSheet__r.Start_Date__c=:currentDate order by Row__c,Date__c asc];
        
        map<integer,list<Time_Entry__c>> keyEntryMap=new map<integer,list<Time_Entry__c>>();
        map<integer,string> keyProjectId=new map<integer,string>();
        map<integer,string> keyTaskId=new map<integer,string>();
        
        for(Time_Entry__c te:TEs){
            string ProjectId=te.Project__c;
            string TaskId=te.Task__c!=null?te.Task__c:null;
                       
            integer key=integer.valueof(te.Row__c);
            
            keyProjectId.put(key,ProjectId);
            keyTaskId.put(key,TaskId);
            
            if(!keyEntryMap.containskey(key)){
                keyEntryMap.put(key,new list<Time_Entry__c>());
            }
            keyEntryMap.get(key).add(te);
        }
        
    
        for(integer pStr:keyEntryMap.keyset()){
            string ProjectId=keyProjectId.get(pStr);
            string taskId=keyTaskId.get(pStr);
            
            TimeEntryRow ter=new TimeEntryRow();
            ter.key=pStr;
            ter.ProjectId=ProjectId;
            ter.TaskId=TaskId;
            //ter.isTask
            
            list<TimeEntry> TimeEntries=new list<TimeEntry> ();
            integer subCount=0;
            for(Time_Entry__c te:keyEntryMap.get(pStr)){
                
                TimeEntry teN=new TimeEntry();
                teN.RecordId=te.id;
                teN.key=pStr+'-'+subcount;
                teN.EntryDate=te.date__c;
                teN.Hours=te.Hours__c;
                teN.isShow=te.Is_Show__c;
                TimeEntries.add(teN);
                subCount++;
            }
            
            ter.TimeEntries=TimeEntries;
            allRows.add(ter);
        }
        return allRows;
    }
    
    //CREATE DEFAULT ENTRIES
    public list<TimeEntryRow>  CreateDefaultEntry(date StartDate,date EndDate){
        
        list<TimeEntryRow> allEntries=new list<TimeEntryRow>();
        
        list<TimeEntry>  TimeEntries=new list<TimeEntry>();
        for(integer i=0;i<StartDate.daysBetween(EndDate);i++){
            TimeEntry te=new TimeEntry();
            te.EntryDate=StartDate.addDays(i);
            te.Hours=0;
            te.key='0-'+i;
            TimeEntries.add(te);
        }
        
        TimeEntryRow ter=new TimeEntryRow();
        ter.ProjectId='';
        ter.TaskId='';
        ter.TimeEntries=TimeEntries;
        ter.key=0;
        allEntries.add(ter);
        
        // list<TimeEntry>   TimeEntries1=new list<TimeEntry>();
        // for(integer i=0;i<StartDate.daysBetween(EndDate);i++){
        //     TimeEntry te=new TimeEntry();
        //     te.EntryDate=StartDate.addDays(i);
        //     te.Hours=1;
        //     te.key='1-'+i;
        //     TimeEntries1.add(te);
        // }
        
        // TimeEntryRow ter1=new TimeEntryRow();
        // ter1.ProjectId='';
        // ter1.TaskId='';
        // ter1.TimeEntries=TimeEntries1;
        // ter1.key=1;
        // allEntries.add(ter1);
        
        return  allEntries;
    }
    
    //CREATE HEADER
    
    public list<OneCol> createHeader(Result rs,date StartDate,date endDate,string Interval,boolean readOnly){
    
        list<OneCol> Headers=new list<OneCol>();
        
        if(readOnly!=true){
            OneCol  act=new OneCol();
            act.label='';
            Headers.add(act);
        }
        
        OneCol ocProject =new OneCol();
        ocProject.label='Assignment';
        ocProject.isDate=false;
        Headers.add(ocProject);
        
        if(rs.hidetask!=true){
            OneCol ocTask =new OneCol();
            ocTask.label='Task';
            ocTask.isDate=false;
            Headers.add(ocTask);
        }
        
      //  date startDate=StartDate;
        for(integer i=0;i<startDate.daysBetween(EndDate);i++){
            date currentDate=StartDate.addDays(i);
            OneCol oc=new OneCol();
            oc.isDate=true;
 
            oc.Label=string.valueof(currentDate);
            
            Datetime dt = DateTime.newInstance(currentDate, Time.newInstance(0, 0, 0, 0));
            String dayOfWeek=dt.format('EEEE');
            if(rs.DayOnly==true){
                oc.Label=dayOfWeek;
            }else if(rs.ShortDaywithDate==true){
                oc.Label+='('+dayOfWeek.substring(0,3)+')';
            }
           
            Headers.add(oc);
        }
        return Headers;
    }
    
    public class Result{
        
        public Result(){
            isPicklist=true;
            EntryProjectObject = '';
            EntryProjectObjectLabel = '';
            EntryTaskObject = '';
            EntryTaskObjectLabel = '';
            EmployeeFieldObject = '';
            EmployeeFieldObjectLabel = '';
            ApprovalMessage = '';
        }
        @auraEnabled
        public string ApprovalMessage;
        
        @auraEnabled
        public boolean reset;
        
        @auraEnabled 
        public boolean readOnly;
        
        @auraEnabled
        public string Recordid;
        @auraEnabled
        public string Name;
        @auraEnabled
        public string EntryProjectField;
        @auraEnabled
        public string EntryProjectObject;
        @auraEnabled
        public string EntryProjectObjectLabel;
        
        
        @auraEnabled
        public string EntryTaskField;       
        @auraEnabled
        public string EntryTaskObject;
        @auraEnabled
        public string EntryTaskObjectLabel;
       
        @auraEnabled
        public string EmployeeField;
        @auraEnabled
        public string EmployeeFieldObject{get;set;}
        @auraEnabled
        public string EmployeeFieldObjectLabel{get;set;}
        
        
        @auraEnabled
        public boolean HideTask;
        @auraEnabled
        public boolean ShowWeekend;
        @auraEnabled
        public boolean TaskRequired;
        @auraEnabled
        public string  WeekStartDay;
        
        
        @auraEnabled
        public string DateLabel;       
        @auraEnabled
        public string SelectedEmp; 
        @auraEnabled
        public date StartDate;
        @auraEnabled
        public date EndDate;
        @auraEnabled
        public list<DateRanges> ValidDates;
        @auraEnabled
        public list<TimeEntryRow> timeEntries;
        @auraEnabled
        public list<OneCol> Header;
              
        @auraEnabled
        public boolean DateOnly;
        @auraEnabled
        public boolean DayOnly;
        @auraEnabled
        public boolean ShortDaywithDate;

        @AuraEnabled
        public boolean isPicklist;
    }
    
    public class OneCol{
        @auraEnabled
        public string Label;
        @auraEnabled
        public boolean isShow;
        @auraEnabled
        public boolean isDate;
        @auraEnabled
        public boolean isHoliday;
        @auraEnabled
        public boolean isLeave;
        
        public OneCol(){
            isShow=true;
        }
    }
    
    public class TimeEntryRow{
        @auraEnabled 
        public boolean readOnly;
        
        @auraEnabled
        public integer key; 
        @auraEnabled
        public string ProjectId;
        @auraEnabled
        public string TaskId;
        @auraEnabled
        public boolean isTask;
        @auraEnabled
        public list<TimeEntry> TimeEntries;
        
        public TimeEntryRow(){
            isTask=true;
            key=0;
        }
    }
    
    public class TimeEntry{
         @auraEnabled
        public string RecordId;
        @auraEnabled
        public string key;
        @auraEnabled
        public date EntryDate;
        @auraEnabled
        public datetime startDate;
        @auraEnabled
        public datetime endDate;
        @auraEnabled
        public decimal Hours;
        @auraEnabled
        public boolean isShow;
        
        public TimeEntry(){
            isShow=true;
            key='0';
        }
    }
    
    public class DateRanges{
        @auraEnabled
        public date StartDate;
        @auraEnabled
        public date EndDate;
    }
    
}