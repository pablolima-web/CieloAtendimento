import { LightningElement, wire, track, api} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { subscribe, MessageContext } from 'lightning/messageService';
import CONTRACT_UPDATED_CHANNEL from '@salesforce/messageChannel/Contract_Template_Updated__c';
//Apex Costum
import getCaseEvents from '@salesforce/apex/ATD_SearchCaseController.getCaseEvents';
import queryEvents from '@salesforce/apex/ATD_EventDetailsController.queryEvents';
import viewMerchantDomicile from '@salesforce/apex/ATD_VisualMerchantDomicile.viewMerchantDomicile';
    
    const FIELDS = [
        'Contract.StartDate',
        'Contract.EndDate',
        'Contract.FDVCC_ECNumber__c'
    ]

    export default class SearchCase extends LightningElement {
        @api recordId;
        listCasesRespData; 
        caseDetailsResponseData = null; 
        actions = [
            { label: 'Visualizar Detalhes', name: 'viewDetails', value: 'viewDetails', icon: 'utility:zoomin'},
        ];
        modalContainer = false;
        notData = false;
        contractData; 
        startDate;
        endDate;
        ecNumber;
        @track responseDataEvents = [];
        @track responseDataEventsFilter = [];
        @track responseDataEventsAll = [];
        @track responseDataEventsPagination = [];
        data;
        eventCode = null;
        referCode;
        filter = false;
        view = false;

        //============== VARIÁVEIS DE PAGINAÇÃO ==================
        @api perPage = 5;
        @api page = 1;
        @api totalPage = 0;
        //@track ListPaginationDataEvents = [];

        
        // RECUPERA INFORMAÇÕES DA ORG
        @wire(getRecord, { recordId: '$recordId', fields: FIELDS})
        contract({error, data}){
            if(data){
                console.log('LWC - searchCase v10');
                // console.log('Data:>>> ' + JSON.stringify(data));
                this.contractData = data;
                console.log('This.contractData:>>> ' + JSON.stringify(this.contractData));
                this.startDate = this.contractData.fields.StartDate.value;
                this.endDate = this.contractData.fields.EndDate.value;
                this.ecNumber = this.contractData.fields.FDVCC_ECNumber__c.value;
                this.eventsCode(this.ecNumber, this.startDate, this.endDate);
               
            }else if(error){
                console.log('erro contractData ' + JSON.stringify(error));
            }
        };

        @wire(MessageContext)
        messageContext;

        connectedCallback(){
            console.log('<<<-SearchCase-connectedCallback() v2>>>');
            this.viewMerchantMethod();
            this.subscribeToMessageChannel();
        }
        subscribeToMessageChannel() {
            console.log('SearchCase-subscribeToMessageChannel()>>>');
            this.subscription = subscribe(this.messageContext,CONTRACT_UPDATED_CHANNEL,(message) => this.handleMessage(message));
            console.log('<<<SearchCase-this.subscription>>>' + JSON.stringify(this.subscription));
        }
        handleMessage(message) {
            //tratar a visualização do componente
            console.log('<<<handleMessage()>>>');
            console.log('message>>>' + message);
            if(message.nivel != '0' && message.nivel != '1'){
                //Exibe seu componente.
              this.view = true;
            }
        }
    
        // CHAMADA DA PRIMEIRA INTEGRAÇÃO, RETORNA OS CASOS
        eventsCode(ecNumber, startDate, endDate){
            console.log('<<<Método eventsCode(ecNumber, startDate, endDate)>>>');
            console.log('ecNumber: ' + ecNumber, 'startDate: ' + startDate, 'endDate: ' + endDate)
            getCaseEvents({ecNumber : ecNumber,  startDate : startDate, endDate : endDate})
            .then(response => {
                this.listCasesRespData = JSON.parse(response);
                console.log('ListEventosRespData:>>>' + JSON.stringify(this.listCasesRespData));
               
               
                if(!this.listCasesRespData){
                    this.notData = true;
                }else{  
                    this.dateFormat(false);
                    console.log('this.listCasesRespData.events:>>>' + JSON.stringify(this.listCasesRespData.events));
    
                }
                
                this.responseDataEventsAll = this.listCasesRespData.events;
                console.log('this.responseDataEventsAll:>>>' + JSON.stringify(this.responseDataEventsAll));

               
                this.totalPage = Math.ceil(this.listCasesRespData.events.length / this.perPage);
                console.log('This.state.totalPage>> ' + this.totalPage);
                this.update();

                console.log('=========== Teste v3 =============');
                 //this.viewMerchantMethod();

            })
            .catch(err => {
                console.log('ListlistEventoRespData-erro:>>>' + JSON.stringify(this.listCasesRespData));
                console.log('response error ' + err);
            })
        }
    
        // VERIFICA QUAL AÇÃO SERÁ EXECUTADA
        handlerActions(evt){
             console.log('<<handlerActions(evt)>>');
            var evtValue = evt.currentTarget.value;
            console.log('evtValue:>> ' + evtValue);
            this.referCode = evt.currentTarget.title;
            console.log('this.referCode>>' + this.referCode);
           
            switch (evtValue) {
                case 'viewDetails':
                    //console.log('<<Entrou no case>>');
                    this.viewEventsDetails();
                  break;

                default:
                  alert(`Ação  ${evtValue} ñ existe.`);
              }
        }

        // CHAMADA DA SEGUNDA INTEGRAÇÃO, RETORNA DETALHES DO CASE
        viewEventsDetails() {
            console.log(`viewEventsDetails()`);
            console.log(`ecNumber: ${this.ecNumber}, referCode: ${this.referCode}, eventCode: ${this.eventCode}`);
            queryEvents({ ecNumber : this.ecNumber, referCode: this.referCode, eventCode: this.eventCode})
            .then(response => {
                this.caseDetailsResponseData = JSON.parse(response);
                console.log('EventDetailsResponseData-v12:>>> ' + JSON.stringify(this.caseDetailsResponseData));
                if(this.caseDetailsResponseData != null){
                    this.dateFormat(true);
                    this.modalContainer = true;
                }
                console.log('EventDetailsResponseData-dataFormt:>>> ' + JSON.stringify(this.caseDetailsResponseData));
            })
            .catch(err => {
                console.log("EventDetailsResponseData-Erro:>>> " + this.caseDetailsResponseData);
                console.log('response error ' + err);
            })
        }

        //VERIFICA SE USUÁRIO ESTA AUTENTICADO
        viewMerchantMethod(){
            viewMerchantDomicile({recordId : this.recordId})
            .then(response => {
                console.log('Usuário Autenticado'+ JSON.stringify(response));
                var viewValue = JSON.parse(response);
                if(viewValue.responseMerchantDomicile == 'S'){
                    this.view = true;
                    console.log('this.view' + this.view)
                }
            })
    
        }    

        //DESABILITA MODAL
        modalAction(){
            if(this.modalContainer == true)
                this.modalContainer = false;
        }
        
        // FILTRAGEM
        handleKeyUp(evt) {
             console.log('evt.target.value:>>> ' + evt.target.value);
             console.log('this.responseDataEventsAll:>>> ' + JSON.stringify(this.responseDataEventsAll));
            if(evt.target.value){
                var search = evt.target.value.toUpperCase();
                console.log('search:>>> ' + search);
                this.data = this.responseDataEventsAll.filter( row =>{
                   return row.Code.includes(search) 
                   || row.Description.includes(search) 
                   || row.CreatedDate.includes(search) 
                   || row.ReferCode.includes(search) 
                   || row.Status.includes(search);
                });
                console.log('this.data:>>> ' + this.data);
                this.filter = true;
                this.responseDataEvents = null;
                this.responseDataEventsFilter = this.data;
                this.totalPage = Math.ceil(this.responseDataEventsFilter.length / this.perPage);
               
            }else{
                //this.responseDataEvents = responseDataEventsPagination;
                this.totalPage = Math.ceil(this.responseDataEventsAll.length / this.perPage);
                this.filter = false;
            }
            this.update();
        }

        //FORMATA A DATA QUE VEM DA INTEGRAÇÃO
        dateFormat(isCaseDetails){
            console.log('<<<dataFormt() v16>>>');
            console.log('isCaseDetails>>>' + isCaseDetails);
            if(!isCaseDetails){
                this.listCasesRespData.events.forEach(element => {
                    if(element.Description != null){
                        element.Description = 
                        element.Description.toUpperCase();
                    }
                    console.log('element.CreatedDate>>>' + element.CreatedDate);
                    if(element.CreatedDate != null){
                        if(element.CreatedDate.length < 7){
                            var ano = element.CreatedDate.slice(0,2);
                            var mes = element.CreatedDate.slice(2,4);
                            var dia = element.CreatedDate.slice(4,6);
                            element.CreatedDate = dia +'/' + mes + '/' + ano
                            console.log('element.createdDate-dd/mm/aa->>> '+ element.CreatedDate);
                        }else{
                            element.CreatedDate = new Date(element.CreatedDate).toLocaleDateString("pt-BR");
                            console.log('element.createdDate-01 Jan, 2022 >>> '+ element.CreatedDate);
                        }
                    }
                });
            }else{
                if(this.caseDetailsResponseData.createdDate.length < 7){
                var ano = this.caseDetailsResponseData.createdDate.slice(0,2);
                var mes = this.caseDetailsResponseData.createdDate.slice(2,4);
                var dia = this.caseDetailsResponseData.createdDate.slice(4,6);
                this.caseDetailsResponseData.createdDate = dia +'/' + mes + '/' + ano
                console.log('DateFormat-dd/mm/aa->>> '+ this.caseDetailsResponseData.createdDate);
                }else{
                    this.caseDetailsResponseData.createdDate = new Date(this.caseDetailsResponseData.createdDate).toLocaleDateString("pt-BR");
                    console.log('DateFormat- Jan >>> '+ this.caseDetailsResponseData.createdDate);
                }
            }
        }

        //MÉTODOS DE PAGINAÇÃO
        next(){
            this.page ++ 
            const passesLastPag = this.page > this.totalPage
            if(passesLastPag){
                this.page --
            }
            this.update()
            console.log('next.page>> ' + this.page)
        }
        prev(){
            this.page --
            if(this.page < 1){
                this.page ++
            }
            this.update()
            console.log('prev.page>> ' + this.page)
        }
        goTo(page){
            console.log('<<<goTo>>>');
            if(page < 1){
                page = 1
                console.log('goTo.first>> ' + this.page)
            }
            if(page > this.totalPage){
                page = this.totalPage
                console.log('goTo.last>> ' + this.page)
            }
            this.page = page
            this.update()
            console.log('page>>>' + page);
        }
        first(){
           this.goTo(1)
        }
        last(){
            this.goTo(this.totalPage)
        }
        update(){
            //console.log('===========Teste paginação=============');
            let page = this.page - 1
            let start = page * this.perPage
            let end = start + this.perPage

           // this.responseDataEventsPagination = this.responseDataEventsAll.slice(start,end)

            if(this.filter){
                console.log('vem do filter');
                this.responseDataEvents = this.responseDataEventsFilter.slice(start,end)
            }else{
                console.log('NÃO vem do filter');
                this.responseDataEvents = this.responseDataEventsAll.slice(start,end)
            }

            console.log('LISTA TOTAL>>> ' + JSON.stringify(this.responseDataEventsAll))
            console.log('NUM RESGISTROS>>> ' + this.responseDataEventsAll.length)
            console.log('LISTA FILTRADA>>> ' + JSON.stringify(this.responseDataEventsFilter))
            console.log('NUM RESGISTROS>>> ' + this.responseDataEventsFilter.length)
            console.log('LISTA PAGINADA>>> ' + JSON.stringify(this.responseDataEventsAll.slice(start,end)))
            console.log('NUM RESGISTROS>>> ' + this.responseDataEventsAll.slice(start,end).length)
        }
    }