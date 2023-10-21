using {general as my} from '../db/schema';

@path: '/service/general'
// @requires: 'authenticated-user'
service generalService {

    entity DOCUMENT_TABLE as
        projection on my.Document;

    action createDocument() ;
    action updateDocument();
    function readDocument() returns String;

    
}
