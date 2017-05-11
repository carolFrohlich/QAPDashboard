import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Anatomical } from '../api/anatomical.js';
import './anatomical.js';
import './functional.js';
import './showAnatomicalPage.js';
import './showFunctionalPage.js';
import './body.html';

Template.App_body.helpers({
  isIndividualPage(){
  	var current = FlowRouter.getRouteName();
  	return current == 'anatomicalSubject.show' || current == 'functionalSubject.show';
  },
  pageName(){
    var current = FlowRouter.getRouteName();
    var subjectId = FlowRouter.getParam("subjectid");
    if (current == 'anatomicalSubject.show') {
      return subjectId + ' anatomical';
    }
    else{
      return subjectId + ' functional';
    }
  },

  isAnatomicalPage(){
  	var current = FlowRouter.getRouteName();
  	if (current == 'anatomical') {return "activePage"};
  },
  isFunctionalPage(){
  	var current = FlowRouter.getRouteName();
  	if (current == 'functional') {return "activePage"};
  },
});
