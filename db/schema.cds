namespace general;

using {
    Country,
    Currency,
    Language,
    User,
    cuid,
    extensible,
    managed,
    temporal
} from '@sap/cds/common';


entity Document {
    key ID         : UUID @Core.Computed;
        DOC_TYPE   : String(100);
        DOC_ID     : String(100);
        NAME       : String(100);
        MIME_TYPE  : String(100);
        STATUS     : String(100);
        CREATED_BY : String(100);
        CREATED_AT : String(100) default CURRENT_TIMESTAMP;
    
}
