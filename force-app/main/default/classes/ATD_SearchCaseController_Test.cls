/**
 * @description       : classe de testes da classe "ATD_SearchCaseController"
 * @author            : pablo.a.lima@accenture.com
 * @group             : 
 * @last modified on  : 14-04-2022
 * @last modified by  : pablo.a.lima@accenture.com
**/
@isTest
public class ATD_SearchCaseController_Test {

@isTest 
static void searchCaseSucess(){
    
    String ecNumber = '10056171';
    String startDate = '2022-01-21';
    String endDate = '2022-02-21';

    List<String> params = new List<String>{ecNumber, startDate, endDate};

    MultiRequestMock multiRequestMock = new MultiRequestMock();

    multiRequestMock.addRequestMock(String.format(CalloutSetting__mdt.getInstance('ATD_IntegrationSearchCase').Endpoint__c,params), new ATD_IntegrationSearchCase_Mock(200));

    multiRequestMock.addRequestMock(CalloutSetting__mdt.getInstance('IntegrationBaseUrlCielo').Endpoint__c + CalloutSetting__mdt.getInstance('ATD_IntegrationAuthMule').Endpoint__c, new ATD_IntegrationAuthMule_Mock(200));

    Test.startTest();

    Test.setMock(HttpCalloutMock.class, multiRequestMock);
    //Test.setMock(HttpCalloutMock.class, new ATD_IntegrationSearchCase_Mock(200));

    String response = ATD_SearchCaseController.getCaseEvents(ecNumber, startDate, endDate);

    Test.stopTest();

    System.assertNotEquals(response, null, 'classe de teste falhou');
}
    

}