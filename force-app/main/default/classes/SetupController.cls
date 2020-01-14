public class SetupController extends TimeSheetService{
    
    public SetupController(){
        super();
    }
    
    @auraEnabled
    public static TimeSheetSetting getDefaultSetup(){
        return new SetupController().getSetting();
    }
    
    @auraEnabled
    public static string SaveBasicSetting(string BasicSetting){
        if(BasicSetting==null || BasicSetting=='')
            return 'Setting is NULL or Blank';
        return new SetupController().SaveBasic(BasicSetting);
  
    }
}