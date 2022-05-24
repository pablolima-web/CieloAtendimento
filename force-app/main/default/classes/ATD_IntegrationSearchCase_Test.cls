/**
 * @description       : classe de testes da classe "ATD_IntegrationSearchCase"
 * @author            : pablo.a.lima@accenture.com
 * @group             : 
 * @last modified on  : 14-02-2022
 * @last modified by  : pablo.a.lima@accenture.com
**/
@IsTest
private class ATD_IntegrationSearchCase_Test {

    @isTest 
    static void testCallout() {

        String token = 'beqdgceybvcyugefw3';
        List<String> params = new List<String>{'2004545393','2022-01-21','2022-02-21'};
        MultiRequestMock multiRequestMock = new MultiRequestMock();
        multiRequestMock.addRequestMock(String.format(CalloutSetting__mdt.getInstance('ATD_IntegrationSearchCase').Endpoint__c,params), new ATD_IntegrationSearchCase_Mock(200));
        multiRequestMock.addRequestMock(CalloutSetting__mdt.getInstance('IntegrationBaseUrlCielo').Endpoint__c + CalloutSetting__mdt.getInstance('ATD_IntegrationAuthMule').Endpoint__c, new ATD_IntegrationAuthMule_Mock(200));
        Test.startTest();
        //Test.setMock(HttpCalloutMock.class, multiRequestMock);
          Test.setMock(HttpCalloutMock.class, new ATD_IntegrationSearchCase_Mock(200));
          ATD_IntegrationSearchCase integSearchCase  = new ATD_IntegrationSearchCase('2004545393','2022-01-21','2022-02-21', token);
          ATD_IntegrationSearchCase.ResponseSearchCase response = integSearchCase.execute();
        Test.stopTest();
        System.AssertNotEquals(null, response, 'response error');
        
      }

      @isTest 
      static void testCalloutFail() {
        String token = 'beqdgceybvcyugefw3';
        List<String> params = new List<String>{'2004545393','2022-01-21','2022-02-21'};
        MultiRequestMock multiRequestMock = new MultiRequestMock();
        multiRequestMock.addRequestMock(String.format(CalloutSetting__mdt.getInstance('ATD_IntegrationSearchCase').Endpoint__c,params), new ATD_IntegrationSearchCase_Mock(400));
        multiRequestMock.addRequestMock(CalloutSetting__mdt.getInstance('IntegrationBaseUrlCielo').Endpoint__c + CalloutSetting__mdt.getInstance('ATD_IntegrationAuthMule').Endpoint__c, new ATD_IntegrationAuthMule_Mock(200));
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, multiRequestMock);
          //Test.setMock(HttpCalloutMock.class, new ATD_IntegrationSearchCase_Mock(400));
          ATD_IntegrationSearchCase integSearchCase  = new ATD_IntegrationSearchCase('2004545393','2022-01-21','2022-02-21', token);
          ATD_IntegrationSearchCase.ResponseSearchCase response = integSearchCase.execute();
        Test.stopTest();
        system.AssertEquals(null, response, 'response error');
      }
}