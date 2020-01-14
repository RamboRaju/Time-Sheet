public class Utility{
    
    public static string getParentFieldName(string ParentRecordId,string sobjectName){
        String sObjName = id.valueof(ParentRecordId).getSObjectType().getDescribe().getName();
        Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
        string fieldName='';
        if(gd.containskey(sobjectName)){           
            Schema.SObjectType sobjType = gd.get(sobjectName); 
            Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(sobjectName).getDescribe(); 
            Map<String,Schema.SObjectField> fieldsMap = describeResult.fields.getMap();
            for(string fl:fieldsMap.keyset()){
                Schema.DescribeFieldResult field=fieldsMap.get(fl).getDescribe();
                if(string.valueof(field.getType())=='REFERENCE'){
                    string lookupObj=string.valueof(field.getReferenceTo()[0]);
                    if(sObjName==lookupObj){
                        fieldName=fl;
                        break;
                    }
                        
                }
            }
        }
        return fieldName;
    }
    public static set<string> getFields(string objectName){
        
        set<string> fields=new set<string>();
        
        Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
       
        if(gd.containskey(objectName)){
          
            Schema.SObjectType sobjType = gd.get(objectName); 
            Schema.DescribeSObjectResult describeResult = sobjType.getDescribe(); 
            Map<String,Schema.SObjectField> fieldsMap = describeResult.fields.getMap();
            
            for(string fl:fieldsMap.keyset()){
                Schema.DescribeFieldResult field=fieldsMap.get(fl).getDescribe();
                fields.add(field.getName());
            }
        }
        
        return fields;
    }
    
    public static string createQuery(set<string> fields,string sobjectName){
        string query='select ';
        for(string fl:fields){
            query+=fl+',';
        }
        
        query=query.removeEnd(',');
        query+=' from '+sobjectName;
        system.debug('************qyer'+query);
        return query;
    }
    
    public static date StartOfWeek(string WeekStart,date CurrentDate){
        
        Date monday = Date.newInstance(1900, 1, 1);
        integer index=Math.mod(monday.daysBetween(CurrentDate), 7);
      
        map<string,integer> DateMap=getDateMap();       
        integer DayIndex=DateMap.get(WeekStart);
        
        integer ReducedDays=0;
        if(DayIndex>index)
            ReducedDays=7-(DayIndex-index);
        else
            ReducedDays=index-DayIndex;
      
        ReducedDays=-1*ReducedDays;
        
        date weekStartDays=CurrentDate.adddays(ReducedDays);
      
        return weekStartDays;
    }
    
    public static map<string,integer> getDateMap(){
        map<string,integer> dateMap=new map<string,integer>();
        dateMap.put('MONDAY',0);
        dateMap.put('TUEDAY',1);
        dateMap.put('WEDNESDAY',2);
        dateMap.put('THURSDAY',3);
        dateMap.put('FRIDAY',4);
        dateMap.put('SATURDAY',5);
        dateMap.put('SUNDAY',6);
        return dateMap;
    }
}