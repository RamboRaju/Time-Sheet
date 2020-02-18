public class TimeSheetEngagement{
    @auraEnabled
    public static List<TimeSheet_Engagement_Type__c> getEngagementType(String recordId){
        List<TimeSheet_Engagement_Type__c>  TimeSheetEngagementTypeList = new List<TimeSheet_Engagement_Type__c>();
        TimeSheetEngagementTypeList = [Select id ,Name,TimeSheet_Engagement__c,
        TimeSheet_Type__r.Name, TimeSheet_Type__c from TimeSheet_Engagement_Type__c 
        where TimeSheet_Engagement__c =:recordId ORDER BY Name DESC]; 
        return TimeSheetEngagementTypeList;
    }

    @AuraEnabled
    public static LinkedAndUnlikedType getLinkedEngagementype(String recordId){
        List<TimeSheet_Engagement_Type__c>  TimeSheetEngagementTypeList = new List<TimeSheet_Engagement_Type__c>();
        TimeSheetEngagementTypeList = [Select id ,Name,TimeSheet_Engagement__c,
        TimeSheet_Type__r.Name, TimeSheet_Type__c from TimeSheet_Engagement_Type__c 
        where TimeSheet_Engagement__c =:recordId ORDER BY TimeSheet_Type__r.Name DESC]; 
        //return TimeSheetEngagementTypeList;

        List<LinkedTimeSheetType> LinkedTimeSheetTypeList = new List<LinkedTimeSheetType>();
        Set<Id> typeSet = new Set<Id>();

        for(TimeSheet_Engagement_Type__c tet :TimeSheetEngagementTypeList){
            LinkedTimeSheetType thisLinkedTimeSheetType = new LinkedTimeSheetType();
            thisLinkedTimeSheetType.isCheck = true;
            thisLinkedTimeSheetType.type =  tet.TimeSheet_Type__r.Name;
            thisLinkedTimeSheetType.recordId = tet.TimeSheet_Type__c;
            thisLinkedTimeSheetType.junctionId = tet;
            LinkedTimeSheetTypeList.add(thisLinkedTimeSheetType);
            typeSet.add(tet.TimeSheet_Type__c);
        }

        List<Task__c> UnlinkedTypeList = new List<Task__c>();
        UnlinkedTypeList = [Select id, Name,Active__c from Task__c where Active__c = 'Active' 
        And id not in:typeSet ORDER BY Name DESC];

        List<UnlinkedTimeSheetType> UnlinkedTimeSheetTypeList = new List<UnlinkedTimeSheetType>();

        for(Task__c tt : UnlinkedTypeList){

            UnlinkedTimeSheetType thisUnlinkedTimeSheetType = new UnlinkedTimeSheetType();
            thisUnlinkedTimeSheetType.isCheck = false;
            thisUnlinkedTimeSheetType.type = tt.Name;
            thisUnlinkedTimeSheetType.recordId = tt.id;
            UnlinkedTimeSheetTypeList.add(thisUnlinkedTimeSheetType);
        }

        LinkedAndUnlikedType thisLinkedAndUnlikedType = new LinkedAndUnlikedType();
        thisLinkedAndUnlikedType.LinkedTimeSheetTypeList = LinkedTimeSheetTypeList;
        thisLinkedAndUnlikedType.UnlinkedTimeSheetTypeList = UnlinkedTimeSheetTypeList;

        return thisLinkedAndUnlikedType;
    }

    @AuraEnabled
    public static List<TimeSheet_Engagement_Type__c> updateEngagement(String updatedValue,String recordId){
        LinkedAndUnlikedType lu=(LinkedAndUnlikedType)JSON.deserialize(updatedValue, LinkedAndUnlikedType.class);
        
        List<LinkedTimeSheetType> LinkedTimeSheetTypeList = lu.LinkedTimeSheetTypeList;
        List<UnlinkedTimeSheetType> UnlinkedTimeSheetTypeList = lu.UnlinkedTimeSheetTypeList;
   
        List<TimeSheet_Engagement_Type__c> linkedSetforDelete = new List<TimeSheet_Engagement_Type__c>();
        List<TimeSheet_Engagement_Type__c > listForInsert = new List<TimeSheet_Engagement_Type__c >();
        
        for(LinkedTimeSheetType ltt : LinkedTimeSheetTypeList){
            if(!ltt.isCheck){
                linkedSetforDelete.add(ltt.junctionId);
            }     
        }

        for(UnlinkedTimeSheetType utt:UnlinkedTimeSheetTypeList){
            if(utt.isCheck){
                TimeSheet_Engagement_Type__c thisTimeSheetEngagementType = new TimeSheet_Engagement_Type__c();
                thisTimeSheetEngagementType.TimeSheet_Engagement__c = recordId;
                thisTimeSheetEngagementType.TimeSheet_Type__c = utt.recordId;
                listForInsert.add(thisTimeSheetEngagementType);
            }
        }

        if(linkedSetforDelete.size() > 0){
            delete linkedSetforDelete;
        }

        if(listForInsert.size() > 0){
            insert listForInsert;
        }

        return getEngagementType(recordId);

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
        public TimeSheet_Engagement_Type__c junctionId;
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