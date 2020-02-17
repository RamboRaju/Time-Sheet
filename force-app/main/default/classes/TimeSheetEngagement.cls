public class TimeSheetEngagement{
    @auraEnabled
    public static List<TimeSheet_Engagement_Type__c> getEngagementType(String recordId){
        List<TimeSheet_Engagement_Type__c>  TimeSheetEngagementTypeList = new List<TimeSheet_Engagement_Type__c>();
        TimeSheetEngagementTypeList = [Select id ,Name,TimeSheet_Engagement__c,
        TimeSheet_Type__r.Name, TimeSheet_Type__c from TimeSheet_Engagement_Type__c where TimeSheet_Engagement__c =:recordId]; 
        return TimeSheetEngagementTypeList;
    }

    @AuraEnabled
    public static LinkedAndUnlikedType getLinkedEngagementype(String recordId){
        List<TimeSheet_Engagement_Type__c>  TimeSheetEngagementTypeList = new List<TimeSheet_Engagement_Type__c>();
        TimeSheetEngagementTypeList = [Select id ,Name,TimeSheet_Engagement__c,
        TimeSheet_Type__r.Name, TimeSheet_Type__c from TimeSheet_Engagement_Type__c 
        where TimeSheet_Engagement__c =:recordId]; 
        //return TimeSheetEngagementTypeList;

        List<LinkedTimeSheetType> LinkedTimeSheetTypeList = new List<LinkedTimeSheetType>();
        Set<Id> typeSet = new Set<Id>();
        for(TimeSheet_Engagement_Type__c tet :TimeSheetEngagementTypeList){
            LinkedTimeSheetType thisLinkedTimeSheetType = new LinkedTimeSheetType();
            thisLinkedTimeSheetType.isCheck = true;
            thisLinkedTimeSheetType.type =  tet.TimeSheet_Type__r.Name;
            thisLinkedTimeSheetType.recordId = tet.TimeSheet_Type__c;
            thisLinkedTimeSheetType.junctionId = tet.id;
            LinkedTimeSheetTypeList.add(thisLinkedTimeSheetType);
            typeSet.add(tet.TimeSheet_Type__c);
        }

        List<Task__c> UnlinkedTypeList = new List<Task__c>();
        UnlinkedTypeList = [Select id, Name from Task__c where id not in:typeSet];
        List<UnlinkedTimeSheetType> UnlinkedTimeSheetTypeList = new List<UnlinkedTimeSheetType>();
        for(Task__c tt : UnlinkedTypeList){
            UnlinkedTimeSheetType thisUnlinkedTimeSheetType = new UnlinkedTimeSheetType();
            thisUnlinkedTimeSheetType.isCheck = true;
            thisUnlinkedTimeSheetType.type = tt.Name;
            thisUnlinkedTimeSheetType.recordId = tt.id;
            UnlinkedTimeSheetTypeList.add(thisUnlinkedTimeSheetType);
        }

        LinkedAndUnlikedType thisLinkedAndUnlikedType = new LinkedAndUnlikedType();
        thisLinkedAndUnlikedType.LinkedTimeSheetTypeList = LinkedTimeSheetTypeList;
        thisLinkedAndUnlikedType.UnlinkedTimeSheetTypeList = UnlinkedTimeSheetTypeList;

        return thisLinkedAndUnlikedType;
    }

    public class EngagementType {
        @AuraEnabled
        public Boolean isCheck;
        @AuraEnabled
        public String typeId;
        @AuraEnabled
        public String type;
        @AuraEnabled
        public String recordId;

    }

    public class LinkedAndUnlikedType{
        @AuraEnabled
        public List<LinkedTimeSheetType> LinkedTimeSheetTypeList;
        @AuraEnabled
        public List<UnlinkedTimeSheetType> UnlinkedTimeSheetTypeList;
    }

    public class LinkedTimeSheetType{
        @AuraEnabled
        public Boolean isCheck;
        @AuraEnabled
        public String typeId;
        @AuraEnabled
        public String type;
        @AuraEnabled
        public String recordId;
        @AuraEnabled
        public String junctionId;
    }

    public class UnlinkedTimeSheetType{
        @AuraEnabled
        public Boolean isCheck;
        @AuraEnabled
        public String typeId;
        @AuraEnabled
        public String type;
        @AuraEnabled
        public String recordId;
    }
}