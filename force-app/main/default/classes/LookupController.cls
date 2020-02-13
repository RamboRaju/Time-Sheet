public class LookupController extends DescribeSObject{
    
    private final static Integer MAX_RESULTS = 5;
    
    public LookupController(){
        super();
    }
    
    @auraEnabled
    public static list<SearchResult> getSearchResult(string searchTerm,string sObjectName,string parentRecord){
        list<SearchResult> SearchResults=new list<SearchResult>();
        
        string fieldName='';
        if(parentRecord!=null && parentRecord.trim()!='' && parentRecord instanceof  Id){
            fieldName=Utility.getParentFieldName(parentRecord,sObjectName);
        }
        
        LookupController  lc=new LookupController();
        sObjectDetail detail=lc.getSobjectLabel(sObjectName);
        string Icon=lc.getIconName(sObjectName);
        
        searchTerm += '%';
        string query='select id,'+detail.NameField+' from '+sObjectName+' where '+detail.NameField+' like:searchTerm ';
        
        if(fieldName!=null && fieldName.trim()!=''){
            query+=' and '+fieldName+'=:parentRecord ';
        }
        
        query+='limit:MAX_RESULTS';
        list<sobject> records=database.query(query);
        if(records.size()>0){
            for(sobject sobj:records){
                SearchResult sr=new SearchResult();
                sr.id=(id)sobj.get('Id');
                sr.icon=Icon;
                sr.title=(string)sobj.get(detail.NameField);
                sr.subtitle=detail.Label+' '+(string)sobj.get(detail.NameField);
                SearchResults.add(sr);
            }
        }
        
        return SearchResults;
    }

    @auraEnabled
    public static list<SearchResult> getPicklistResult(string sObjectName,string parentRecord){
        List<SearchResult> picklistResults = new List<SearchResult>();
        
        string fieldName='';
        if(parentRecord!=null && parentRecord.trim()!='' && parentRecord instanceof  Id){
            System.System.debug('parentRecord '+parentRecord);
            fieldName=Utility.getParentFieldName(parentRecord,sObjectName);
            System.System.debug('fieldName '+fieldName);
        }
        
        LookupController  lc=new LookupController();
        sObjectDetail detail=lc.getSobjectLabel(sObjectName);
        string Icon=lc.getIconName(sObjectName);
        
        string query='select id,'+detail.NameField+' from '+sObjectName;

        //===============
        //fetching task data using junction object TimeSheet_Engagement_Type__c
        List<TimeSheet_Engagement_Type__c>  TimeSheetEngagementTypeList = new List<TimeSheet_Engagement_Type__c>();
        TimeSheetEngagementTypeList = [Select id ,TimeSheet_Engagement__c,TimeSheet_Type__c from TimeSheet_Engagement_Type__c where TimeSheet_Engagement__c =:parentRecord]; 
        Set<Id> TypeId = new  Set<Id>();
        for(TimeSheet_Engagement_Type__c tet: TimeSheetEngagementTypeList){
            TypeId.add(tet.TimeSheet_Type__c);
        }

        //==============
        if(sObjectName == 'Task__c'){
            query+= ' where id in :TypeId ';
            System.System.debug('query '+query);
            list<sobject> records=database.query(query);
            if(records.size()>0){
                for(sobject sobj:records){
                    SearchResult sr=new SearchResult();
                    sr.id=(id)sobj.get('Id');
                    sr.icon=Icon;
                    sr.title=(string)sobj.get(detail.NameField);
                    sr.subtitle=detail.Label+' '+(string)sobj.get(detail.NameField);
                    picklistResults.add(sr);
                }
            }

        }else{

            if(fieldName!=null && fieldName.trim()!=''){
                query+=' where '+fieldName+'=:parentRecord ';
            }
            System.System.debug('query '+query);
            //query+='limit:MAX_RESULTS';
            list<sobject> records=database.query(query);
            if(records.size()>0){
                for(sobject sobj:records){
                    SearchResult sr=new SearchResult();
                    sr.id=(id)sobj.get('Id');
                    sr.icon=Icon;
                    sr.title=(string)sobj.get(detail.NameField);
                    sr.subtitle=detail.Label+' '+(string)sobj.get(detail.NameField);
                    picklistResults.add(sr);
                }
            }
        }   
        return picklistResults;
    }
    
    @auraEnabled
    public static list<SearchResult> getDefaultResult(string recordId,string sObjectName){
        list<SearchResult> SearchResults=new list<SearchResult>();
        
        LookupController  lc=new LookupController();
        sObjectDetail detail=lc.getSobjectLabel(sObjectName);
        string Icon=lc.getIconName(sObjectName);
        
        string query='select id,'+detail.NameField+' from '+sObjectName+' where  id=:recordId '+'limit:MAX_RESULTS';
        list<sobject> records=database.query(query);
        if(records.size()>0){
            for(sobject sobj:records){
                SearchResult sr=new SearchResult();
                sr.id=(id)sobj.get('Id');
                sr.icon=Icon;
                sr.title=(string)sobj.get(detail.NameField);
                sr.subtitle=detail.Label+' '+(string)sobj.get(detail.NameField);
                SearchResults.add(sr);
            }
        }
        
        return SearchResults;
    }

    
    public class SearchResult{
        @auraEnabled
        public string id;
        @auraEnabled
        public string icon;
        @auraEnabled
        public string title;
        @auraEnabled
        public string subtitle;
    }

}