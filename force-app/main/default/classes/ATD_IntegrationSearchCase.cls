public with sharing class ATD_IntegrationSearchCase extends ATD_IntegrationRestBase{
   
    List<String> params = new List<String>{};
	String token;
    public ResponseSearchCase responseIntegrationCase = new ResponseSearchCase();

    public ATD_IntegrationSearchCase(String ecNumber, String startDate, String endDate, String token) {
        this.params = new List<String>{ecNumber, startDate, endDate};
        System.debug('this.params-searchCase>>> ' + this.params);
        this.token = token;
    }
    
    public ResponseSearchCase execute(){
        return prepareRequest();
    }

    private ResponseSearchCase prepareRequest(){
        super.setRequestHeader('Content-Type', 'application/json');
        super.setRequestHeader('Authorization', 'Bearer ' + this.token);
        System.debug('<<<token.access_token-searchCase>>> ' + this.token);
        super.prepareRequest('ATD_IntegrationSearchCase', this.params);
        System.debug('<<<antes-sendRequest>>> ');
        super.sendRequest();
        System.debug('<<<depois-sendRequest>>> ');
        //return parseResponse(super.response);
        ATD_IntegrationSearchCase.ResponseSearchCase itg_sc = new ATD_IntegrationSearchCase.ResponseSearchCase(); 
        itg_sc = parseResponse(super.response);
        System.debug('<<<itg-searchCase>>> ' + itg_sc);
        return itg_sc; 
    }
    public ResponseSearchCase parseResponse(HttpResponse response){
        if(response.getStatusCode() == 200){
            if(String.isNotBlank(response.getBody())){
                this.responseIntegrationCase =  (ResponseSearchCase) JSON.deserialize(response.getBody(), ResponseSearchCase.class);

                return this.responseIntegrationCase;
            }
            System.debug('Exception ATD_IntegrationSearchCase => ' + response.getStatusCode() + '\n\n' + response.getBody());
            return null;
        }
        return null;
    }
    public class ResponseSearchCase{
        public String merchantCode;	//2004545393
	    public String contractID;	//800S0000001Qu80IAC
	    public List<Cases> cases;
	    public List<Events> events;
    }
    public class Cases{
        public String caseID;	//500S000000FX7YiIAL
		public String caseNumber;	//00001257
		public String subject;	//Troca de bobina
		public String createdDate;	//2022-02-16T19:45:00.435Z
		public String closedDate;	//2022-02-16T20:45:00.435Z
		public String priority;	//Médio
		public Owner owner;
		public Account account;
		public Contact contact;
    }

    public class Owner{
        public String ownerName;	//Atendente Atento 01
		public String ownerEmail;	//atendente01@cielo.com.br
    }

    public class Account{
        public String companyName;	//Atendente Atento 01
		public String accountNumber;	//atendente01@cielo.com.br
	}

    public class Contact {
		public String contactName;	//Alexandre Suares da Silva
		public String contactTitle;	//Proprietario
		public String contactEmail;	//alexandre.sssilva@cielo.com.br
    }

    public class Events{
        public String Code;	//2719
		public String Description;	//REATIVACAO SUB/MARKETPLACE
		public String CreatedDate;	//2022-02-16T19:55:19.947Z
		public String ReferCode;	//34566745344
		public String Status;	//Solucionado
		public String DependencyCode;	//6000
    }
}