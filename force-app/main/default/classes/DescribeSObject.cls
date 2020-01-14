public virtual  class DescribeSObject{
    
    public String getIconName(String sObjectName){
        
        String u;
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
        List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc) { tabDesc.addAll(tsr.getTabs()); }

        for(Schema.DescribeTabResult tr : tabDesc) {
            if( sObjectName == tr.getSobjectName() ) {
                if( tr.isCustom() == true ) {
                    iconDesc.addAll(tr.getIcons());
                } else {
                    u = 'standard:' + sObjectName.toLowerCase();
                }
            }
        }
        for (Schema.DescribeIconResult ir : iconDesc) {
            if (ir.getContentType() == 'image/svg+xml'){
                u = 'custom:' + ir.getUrl().substringBetween('custom/','.svg').substringBefore('_');
                break;
            }
        }
        
        return u;
    }
    
    public sObjectDetail getSobjectLabel(string sObjectName){
    
        sObjectDetail detail=new sObjectDetail();
        Map<String, Schema.SObjectType> gd =Schema.getGlobalDescribe();
        if(gd.containskey(sObjectName)){
            Schema.SObjectType sobType=gd.get(sObjectName);
            Schema.DescribeSObjectResult sobjectResult=sobType.getDescribe();
            detail.Label=sObjectResult.getLabel();
            Map <String, Schema.SObjectField> fieldMap = sObjectResult.fields.getMap();
            for(Schema.SObjectField sfield : fieldMap.Values()){
                schema.describefieldresult dfield = sfield.getDescribe();
                if(dfield.isNameField()){
                    detail.NameField=dfield.getName();
                    break;
                }
            }
        }
        return detail;
    }
    
    public class sObjectDetail{
        public string Label;
        public string NameField;
        public string DescriptionField; 
    }
   
}