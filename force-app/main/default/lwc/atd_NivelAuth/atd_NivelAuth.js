import { LightningElement, wire, api, track} from 'lwc';
import { getRecord,getRecordNotifyChange, updateRecord} from 'lightning/uiRecordApi';

import requestNivelAuth from '@salesforce/apex/NivelAuthController.requestNivelAuth';
import getProtocol from '@salesforce/apex/ATD_ProtocolController.getProtocol';
import setProtocol from '@salesforce/apex/ATD_ProtocolController.setProtocol';
import createProtocol from '@salesforce/apex/ATD_ProtocolController.createProtocol';
import getRecall from '@salesforce/apex/ATD_RecallController.getRecall';
import updateCall from '@salesforce/apex/NivelAuthController.updateCall';
import updateCallRecall from '@salesforce/apex/NivelAuthController.updateCallRecall';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';

const FIELDS = [
    'ATN_Call__c.ATN_AuthenticationNumber__c',
    'ATN_Call__c.ATN_CustomerIdentified__c',
    'ATN_Call__c.ATN_MfaCode__c',
    'ATN_Call__c.ATN_Skill__c ',
    'ATN_Call__c.ATN_CpfRepresentative__c',
    'ATN_Call__c.ATN_NameRepresentative__c',
    'ATN_Call__c.ATN_ProductionCode__c',
    'ATN_Call__c.ATN_ECNumber__c',
    'ATN_Call__c.ATN_Protocol__c ',
    'ATN_Call__c.ATN_NumberProtocol__c',
    'ATN_Call__c.ATN_ReferProtocol__c',
    'ATN_Call__c.ATN_Recall__c',
    'ATN_Call__c.ATN_Call_Number__c',
    'ATN_Call__c.ATN_Channel__c'
];

export default class Atd_NivelAuth extends LightningElement {

    requestData = {
            mfaCode: '',
            merchantCode: '',
            skillService: '',
            cpfRepresentative: '',
            nameRepresentative: '',
            productionCode: ''     
    };
    contractId;
    @track settedProtocol;
    @track notAuth = true;
    @api recordId;
    @track data;
    @wire(getRecord, ({ recordId: '$recordId', fields: FIELDS}))
    wiredCall({error, data}){
        if(data){
            console.log('entradas -> numero protocolo:  ', data.fields.ATN_ReferProtocol__c.value, ' id protocolo: ',  data.fields.ATN_Protocol__c.value);
            if(data.fields.ATN_ReferProtocol__c.value != null && data.fields.ATN_Protocol__c.value == null){
                this.handleSetProtocol(data.fields.ATN_ReferProtocol__c.value, this.recordId);
                this.settedProtocol = true;                              
            }
            if(data.fields.ATN_AuthenticationNumber__c.value == null || data.fields.ATN_CustomerIdentified__c.value == false){
                if(data.fields.ATN_MfaCode__c.value != null || data.fields.ATN_Skill__c.value != null || data.fields.ATN_CpfRepresentative__c.valu != null){
                    if(this.settedProtocol != true && data.fields.ATN_Protocol__c.value == null){
                        this.contractId = data.fields.ATN_ECNumber__c.value;
                        this.handleProtocol(this.contractId);
                    }
                    else{
                        console.log('Protocolo já preenchido!');
                    }
                    this.requestData.mfaCode = data.fields.ATN_MfaCode__c.value;
                    this.requestData.skillService = data.fields.ATN_Skill__c.value;
                    this.requestData.cpfRepresentative = data.fields.ATN_CpfRepresentative__c.value;
                    if(data.fields.ATN_NameRepresentative__c.value != null)
                        this.requestData.nameRepresentative = data.fields.ATN_NameRepresentative__c.value;
                    if(data.fields.ATN_ProductionCode__c.value != null)
                        this.requestData.productionCode = data.fields.ATN_ProductionCode__c.value;
                    if(data.fields.ATN_ECNumber__c.value != null)
                        this.contractId = data.fields.ATN_ECNumber__c.value;
        
                    console.log('id contrato : ' + this.contractId);
                    console.log('requisição > ::: ' + JSON.stringify(this.requestData));
                    
                    this.handleNivelAuth(JSON.stringify(this.requestData), this.contractId)
                    .then(response => {
                        console.log('RESPONSE :: ' + JSON.stringify(response));
                        const responseData = JSON.parse(response);

                        if(responseData.permissionRate.typeManager == 'B'){
                            responseData.permissionRate.typeManager = 'Banco';
                        }
                        else if(responseData.permissionRate.typeManager == 'C'){
                            responseData.permissionRate.typeManager = 'Comercial';
                        }

                        console.log('TIPO NOVO ' + responseData.permissionRate.typeManager);
                        this.handleUpdateCall(this.recordId, JSON.stringify(Math.floor(responseData.permissionRate.level)), responseData.permissionRate.customerIdentified, responseData.permissionRate.typeManager);
                          
                    })
                    .catch(err => {
                        console.log('RESPONSE ERROR :: ' + err);
                        this.notAuth = true;
                    });
                }
                
            }
            else{
                this.notAuth = false;
                console.log('preenchidos ' + data.fields.ATN_AuthenticationNumber__c.value + ' e  ' + data.fields.ATN_CustomerIdentified__c.value);
            }
            if(data.fields.ATN_ECNumber__c.value != null){
                if(data.fields.ATN_Recall__c.value == false && data.fields.ATN_Call_Number__c.value == null && data.fields.ATN_Channel__c.value == null){
                    this.handleRecall(data.fields.ATN_ECNumber__c.value)
                    .then(response => {
                        const data = JSON.parse(response);
                        const fields = {};
                        let recall = false;
                        let atdQtd = 0;
                        let channel;
                        if(data.interactions.length >= 1){
                            recall = true;
                            atdQtd = data.interactions.length;

                            for(let i = 0; i < data.interactions.length; i++){
                                if(i == 0){
                                    channel = data.interactions[i].systemX;
                                }
                                else{
                                    channel += ' / ' + data.interactions[i].systemX;
                                }
                            }
                        }

                          this.handleUpdateCallRecall(this.recordId, recall, atdQtd, channel);
                          
                          /*
                          updateRecord(recordInput)
                          .then((record) => {
                            console.log('REGISTRO ::: ' + record);
                            this.notAuth = false;
                            console.log('not data ' + this.notAuth );
                          })
                          .catch(err => {
                              console.log('REGISTRO ERRO ' + JSON.stringify(err));
                          });
                          */
                          
                    })
                    .catch(err => {
                        console.log('Recall error :: ' + JSON.stringify(err));
                    })
                }
            }
            
        }
        else if(error){
            console.log('ERRO ::: ' + JSON.stringify(error));
        }
    }
    handleNivelAuth(request, contractId){
        return requestNivelAuth({request: request, contractId: contractId})
        .then(response => {
            return response;
        })
        .catch(err => {
            return err;
        })
    }
    handleProtocol(contractId){
        getProtocol({contractId: contractId})
        .then(response => {
            console.log('PROTOCOL ' + JSON.stringify(response));
            const protocolData = JSON.parse(response);
           // const protocolData = null; // para teste de criação de protocolo
            console.log('PROTOCOLO É ' + JSON.stringify(protocolData));
                if(protocolData != null){
                    this.handleSetProtocol(protocolData.protocol, this.recordId);
                }
                else if(protocolData == null){
                    const protocolString = this.createProtocolNumber();
                    console.log('STRING DO PROTOCOLO ' + protocolString);
                    this.handleCreateProtocol(protocolString, this.recordId);
                    console.log('PROTOCOLO CRIADO POR FUNÇÃO');
                }
            
        })
        .catch(err => {
            console.log('PROTOCOL ERROR ' + err)

            const protocolString = this.createProtocolNumber();
            console.log('STRING DO PROTOCOLO ' + protocolString);
            this.handleCreateProtocol(protocolString, this.recordId);
            console.log('PROTOCOLO CRIADO POR FUNÇÃO');
        })
    }
    handleSetProtocol(protocolId, recordId){
        setProtocol({protocolId: protocolId, recordId: recordId})
        .then(response => {
            console.log('RESPONSE DO SET PROTOCOL  ' + JSON.stringify(response));
            setTimeout(() => {
                eval("$A.get('e.force:refreshView').fire()")
            }, 2000) 
        })
        .catch(err => {
            console.log('SET PROTOCOL ERROR: ' + JSON.stringify(err));
        })
    }
    handleCreateProtocol(protocolNumber, recordId){
        createProtocol({protocolNumber: protocolNumber, recordId: recordId})
        .then(response => {
            console.log('Create Protocol RESPONSE:: ' + JSON.stringify(response));
            setTimeout(() => {
                eval("$A.get('e.force:refreshView').fire()")
            }, 2000) 
        })
        .catch(err => {
            console.log('Create Protocol Error :: ' + JSON.stringify(err));
        })
    }
    handleRecall(contractId){
        return getRecall({contractId: contractId})
        .then(response => {
            return response;
        })
        .catch(err => {
            return err;
        })
    }
    createProtocolNumber(){
        let protocolString;
        let now = new Date();
        const firstData = new Date('1/1/' + now.getFullYear());
        const actualDate = new Date(JSON.stringify((now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear()));
        const diffTime = Math.abs(actualDate - firstData);
        let days = JSON.stringify(Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
        let hours = JSON.stringify(now.getHours());
        let minutes = JSON.stringify(now.getMinutes());
        let seconds = JSON.stringify(now.getSeconds());
        let miliseconds = JSON.stringify(now.getMilliseconds());

        console.log(days + " dayss");
        days = this.prepareDays(days);
        hours = this.prepareTime(hours);
        minutes = this.prepareTime(minutes);
        seconds = this.prepareTime(seconds);
        miliseconds = this.prepareTime(miliseconds);
        

        protocolString = JSON.stringify(now.getFullYear()).substring(2, 4) + days + hours + minutes + seconds + miliseconds;
        console.log('NUMERO DO PROTOCOLO ' + protocolString);
        return protocolString;
    }
    
    prepareDays(days){
        /*
        if(days.length > 2){
            days = days.substring(1, 3);
            console.log('3 numeros ' + days);
            
        }
        */
        if(days.length == 1){
            days = '00' + days;
            console.log('1 numeros ' + days);
        }
        else if(days.length == 2){
            days = '0' + days;
            console.log('numeros ' + days);
        }
        return days;
    }
    prepareTime(time){
        if(time.length < 2){
            time = '0' + time;
         }
         else if(time.length > 2){
            time = time.substring(1, 3);
         } 
        return time;
    }


    handleUpdateCall(recordId, authNumber, customerIdentified, typeManager){
        updateCall({recordId: recordId, authNumber: authNumber, customerIdentified: customerIdentified, typeManager: typeManager})
        .then(response => {
            console.log('Retorno Update');
            this.notAuth = false;
        })
        .catch(err => {
            console.log('error update call ' + JSON.stringify(err));
        })
    }
    handleUpdateCallRecall(recordId, recall, callNumber, channel){
        updateCallRecall({recordId: recordId, recall: recall, callNumber: callNumber, channel: channel})
        .then(response => {
            console.log('Retorno Update Call: ' + JSON.stringify(response));
        })
        .catch(err => {
            console.log('Update call error ' + JSON.stringify(err));
        })
    }
}