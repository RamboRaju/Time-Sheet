public class ganttController extends TimeSheetService{
    
    @auraEnabled
    public static Result getBasicSetting(string recordId){
        return new ganttController().getBasicSetting(recordId);
    }
    
    @auraEnabled
    public static DateRanges getValidDate(string CurrentDate,string Interval,string WeekStartDay){      
        return new ganttController().getValidDate(date.valueof(CurrentDate),Interval,WeekStartDay);
    }
    
    @auraEnabled
    public static TimeEntryRow addEntryRow(string basicstr){
        return new ganttController().addEntryRow(basicstr);
    }
    
    @auraEnabled
    public static Result getUpdateBasicSetting(string baseSettingStr){
        return new ganttController().getUpdateBasicSetting(baseSettingStr);
    }
    
    @auraEnabled
    public static Response SaveTimeSheet(string finalResponse,string mode){
    	return new ganttController().SaveTimeSheet(finalResponse,mode);
    }
    
    @auraEnabled
    public static void deleteRow(string oneRow){
        new ganttController().deleteRow(oneRow);
    }
        
}