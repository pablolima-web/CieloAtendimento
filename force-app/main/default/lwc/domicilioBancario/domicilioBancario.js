import { api, LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import CONTRACT_UPDATED_CHANNEL from '@salesforce/messageChannel/Contract_Template_Updated__c';
import queryMerchant from '@salesforce/apex/ATD_MerchantDomicileController.queryMerchant';
import { getRecord } from 'lightning/uiRecordApi'; 
import FDVCC_ECNumber__c from '@salesforce/schema/Contract.FDVCC_ECNumber__c'; 
import viewMerchantDomicile from '@salesforce/apex/ATD_VisualMerchantDomicile.viewMerchantDomicile'; 

export default class DomicilioBancario extends LightningElement {
    @track customerCode;
    @track contractData;
    @api recordId;
    responseData;
    notData = false;
    view = false;

    connectedCallback(){
        console.log('Entrou no Connected Callback Domicilio Bancário >>>>>>>>>>>>' + this.recordId);
        this.visualMerchantMethod();
        this.subscribeToMessageChannel();
    }

    @wire(MessageContext)
    messageContext;

    @wire(getRecord, {recordId : '$recordId', fields : FDVCC_ECNumber__c})
    contract({error, data}){
        if(data){
            this.contractData = data;
            this.customerCode = this.contractData.fields.FDVCC_ECNumber__c.value;
            this.merchantMethod(this.customerCode);
        }
        else if(error){
            console.log('erro de contractData ::: '+ JSON.stringify(error));
        }
    }
    merchantMethod(customerCode){
        queryMerchant({customerCode : customerCode})
        .then(response => {
            console.log('resposta ::: '+ response);
            this.responseData = JSON.parse(response);
            if(!this.responseData){
                this.notData = true;
            }
        })
        .catch(error => {
            console.log('erro MERCHANT METHOD ::: '+ JSON.stringify(error));
        })
    }
    visualMerchantMethod(){
        viewMerchantDomicile({recordId : this.recordId})
        .then(response => {
            console.log('Usuário Autenticado'+ JSON.stringify(response));
            var viewValue = JSON.parse(response);
            if(viewValue.responseMerchantDomicile == 'S'){
                this.view = true;
            }
        })

    }    
    
    subscribeToMessageChannel() {
      this.subscription = subscribe(
        this.messageContext,
        CONTRACT_UPDATED_CHANNEL,
        (message) => this.handleMessage(message)
      );
    }
    handleMessage(message) {
      if(message.level != '1' && message.level != '0')
      {
        this.view = true;
      }
    }
}