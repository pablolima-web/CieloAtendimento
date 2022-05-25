({
	callServer: function(component, event, helper) {
		var action = component.get("c.showFACController");
		console.log('ANT_FAC - component.get("v.recordId")>>> ' + component.get("v.recordId"));
		action.setParams({
			caseIdParam: component.get("v.recordId")
		});
		action.setCallback(this, function(actionResult) {
		  var returnObject = actionResult.getReturnValue();
		  console.log('ANT_FAC - ReturnObject v3>>> ' + JSON.stringify(returnObject));
		  if(returnObject.msgReturn === 'SUCCESS'){
			console.log('ReturnObject Url- FAQ>>> ' + returnObject.url);
			component.set("v.formReturn", returnObject);
            component.set("v.iframeUrl", returnObject.url);
              
		  }else{

			//this.showToast(component, 'Erro', returnObject.msgReturn, 'Error', 'Dismissibled');
		  }
		});
		$A.enqueueAction(action);
	},
    
    showToast: function(component, title, message, type, mode) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type,
            mode: mode
        });
        toastEvent.fire();
    },
    
    dump: function(obj) {
		var out = "";
		for (var i in obj) {
		  out += i + ": " + obj[i] + "\n";
		}
		alert(out);
	}
})