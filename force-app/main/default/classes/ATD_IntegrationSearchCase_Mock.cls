public with sharing class ATD_IntegrationSearchCase_Mock implements HttpCalloutMock{
    public Integer codHttp;
    public ATD_IntegrationSearchCase_Mock(Integer codHttp){
        this.codHttp = codHttp;
    }
    public HttpResponse respond(HttpRequest request){
        HttpResponse response = new HttpResponse();
        response.setStatusCode(this.codHttp);
        if(this.codHttp == 200){
            String body = '{'+
                '"merchantCode": "2004545393",'+
                '"contractID": "800S0000001Qu80IAC",'+
                '"cases": ['+
                    '{'+
                        '"caseID": "500S000000FX7YiIAL",'+
                        '"caseNumber": "00001257",'+
                        '"subject": "Troca de bobina",'+
                        '"createdDate": "2022-02-16T19:45:00.435Z",'+
                        '"closedDate": "2022-02-16T20:45:00.435Z",'+
                        '"priority": "Médio",'+
                        '"owner": {'+
                            '"ownerName": "Atendente Atento 01",'+
                            '"ownerEmail": "atendente01@cielo.com.br"'+
                        '},'+
                        '"account": {'+
                            '"companyName": "Razao Social Teste",'+
                            '"accountNumber": "001S000001QaOO6IAN"'+
                        '},'+
                        '"contact": {'+
                            '"contactName": "Alexandre Suares da Silva",'+
                            '"contactTitle": "Proprietario",'+
                            '"contactEmail": "alexandre.sssilva@cielo.com.br"'+
                        '}'+
                    '}'+
                '],'+
                '"events": ['+
                    '{'+
                        '"Code": "2719",'+
                        '"Description": "REATIVACAO SUB/MARKETPLACE",'+
                        '"CreatedDate": "2022-02-16T19:55:19.947Z",'+
                        '"ReferCode": "34566745344",'+
                        '"Status": "Solucionado",'+
                        '"DependencyCode": "6000"'+
                    '}'+
                ']'+
            '}';
            response.setBody(body);
        }else {
            ResponseError responseError = new ResponseError();
            responseError.message = 'Parâmetros inválidos';
            response.setBody(JSON.serialize(responseError));
        }
        return response;
    }
    public class ResponseError{
        public String message {get;set;}
    }
}