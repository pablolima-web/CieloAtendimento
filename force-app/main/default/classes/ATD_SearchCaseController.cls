public without sharing class ATD_SearchCaseController {
    @AuraEnabled(cacheable=true)
    public static String getCaseEvents(String ecNumber, String startDate, String endDate){
        System.debug('<<<getCaseEvents(ecNumber:' + ecNumber +', startDate:' + startDate + ', endDate:' + endDate + ')>>>');
        ATD_IntegrationAuthMule.WrapperResponseAuthMule token = ATD_ControllerTokens.tokenAuth2Mule();
        System.debug('token-searchCase >>>>: ' + token);
        ATD_IntegrationSearchCase seachCase = new ATD_IntegrationSearchCase(ecNumber, startDate, endDate, token.access_token);
        System.debug('ATD_IntegrationSearchCase seachCase >>>>: ' + seachCase);
        ATD_IntegrationSearchCase.ResponseSearchCase response = seachCase.execute();
        String responseString = JSON.serialize(response);
        System.debug('response >>>>: ' + response);
        return responseString;
    }
}