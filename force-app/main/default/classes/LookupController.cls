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
            fieldName=Utility.getParentFieldName(parentRecord,sObjectName);
        }
        
        LookupController  lc=new LookupController();
        sObjectDetail detail=lc.getSobjectLabel(sObjectName);
        string Icon=lc.getIconName(sObjectName);
        
        string query='select id,'+detail.NameField+' from '+sObjectName;
        
        if(fieldName!=null && fieldName.trim()!=''){
            query+=' where '+fieldName+'=:parentRecord ';
        }
        
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