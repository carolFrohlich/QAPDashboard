import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FunctionalSpatial } from '../api/functional.js';
import { FunctionalTemporal } from '../api/functional.js';
import './showFunctionalPage.html';
import './charts/boxplot.css';    
import './charts/boxplot.js';


Template.showFunctionalPage.helpers({
  subjectId(){
    var subjectId = FlowRouter.getParam("subjectid");
    return subjectId;
  },
  grayplotImg(){
    var subjectId = FlowRouter.getParam("subjectid");
    var sub = subjectId.split('_')[0]
    var sess = subjectId.split('_')[1]
    var scan = subjectId.split('_')[2]
    var base = Session.get("base") + sub +"/"+sess + "/";
    return base + subjectId +"_timeseries-measures.png";
  }
});

Template.showFunctionalPage.events({
  "click input": function(event, template){
    var overlayVal = ""+ $(event.currentTarget).is(':checked');
    var  overlayName = ""+ $(event.currentTarget).val();
    console.log(overlayName+': '+overlayVal);
    Session.set(overlayName, overlayVal);
    showFunctionalImage();
  },
});

Template.showFunctionalPage.onCreated(function anatomicalOnCreated() {
  Session.set("showSfs", 'true');
  Session.set("showTstd", 'true');
  Session.set("showEn", 'true');
  Session.set("lastPath", '');
});

Template.showFunctionalPage.rendered = function() {
  if(!this._rendered) {
    this._rendered = true;
  }
  funcBoxplotSpatial();
  funcBoxplotTemporal();
  showFunctionalImage();

  this.autorun(function(){
  });
}

showFunctionalImage = function() {
  var subjectId = FlowRouter.getParam("subjectid");
  var sub = subjectId.split('_')[0]
  var sess = subjectId.split('_')[1]
  var scan = subjectId.split('_')[2]
  var base = Meteor.settings.base + sub +"/"+sess + "/";

  var params = {};
  //add all images in the public directory
  var meanFile = base + subjectId +"_mean-functional.nii.gz";
  params["images"] = [meanFile];

  if(Session.get("showSfs") === 'true'){
    var f = base + subjectId +"_SFS.nii.gz";
    params["images"].push(f);
    console.log('show sfs'+' '+Session.get("showSfs"));
    params[subjectId +"_SFS.nii.gz"] = {lut: "Gold"};
  }
  if(Session.get("showTstd") === 'true'){
    var f = base + subjectId +"_temporal-std-map.nii.gz";
    params["images"].push(f);
    params[subjectId +"_temporal-std-map.nii.gz"] = {lut: "Spectrum"};
  }
  if(Session.get("showEn") === 'true'){
    var f = base + subjectId +"_estimated-nuisance.nii.gz";
    params["images"].push(f);
    params[subjectId +"_estimated-nuisance.nii.gz"] = {lut: "Fire"};
  }
  if(Session.get("showGp") === 'true'){
    var f = base + subjectId +"_grayplot-cluster.nii.gz";
    params["images"].push(f);
    //TODO: create color table for grayplot cluster
    params[subjectId +"_grayplot-cluster.nii.gz"] = {lut: "Green Overlay"};
  }

  papaya.Container.addViewer("funcImageDisplay", params, function(err, params){
                                        console.log('papaya callback', err, params)
                                        });
  //papaya.Container.allowPropagation = true;
}

funcBoxplotSpatial = function() {
  var subjectId = FlowRouter.getParam("subjectid");
  var sub = subjectId.split('_')[0]

  var metrics = ['EFC', 'FBER', 'FWHM', 'SNR', 'Ghost_y'];
  for (var i = 0; i < metrics.length; i++) {
    var projection = {};
    projection[metrics[i]] = 1;
    //projection['_id'] = 0;

    var allSubjects = FunctionalSpatial.find({},{fields:projection}).fetch();
    var participantMetrics = FunctionalSpatial.findOne({'Participant': sub }, {fields:projection});
    var chartSize = ($("#boxplotSpatialContainer").width() / 5);

    renderBoxplot(allSubjects, participantMetrics, metrics[i], "#funcBoxplot"+metrics[i], chartSize);
  };
}

funcBoxplotTemporal = function() {
  var subjectId = FlowRouter.getParam("subjectid");
  var sub = subjectId.split('_')[0]

  var metricsName = ['GCOR', 'SFS', 'DVARS', 'RMSD', 'Quality', 'FOO'];
  var metrics = ['GCOR','Signal Fluctuation Sensitivity (Mean)','Std DVARS (Mean)', 'RMSD (Mean)', 'Quality (Mean)','Fraction of OOB Outliers (Mean)']
  for (var i = 0; i < metrics.length; i++) {
    var projection = {};
    projection[metrics[i]] = 1;
    //projection['_id'] = 0;

    var allSubjects = FunctionalTemporal.find({},{fields:projection}).fetch();
    var participantMetrics = FunctionalTemporal.findOne({'Participant': sub }, {fields:projection});
    var chartSize = ($("#boxplotTemporalContainer").width() / 4);
    var niceName = metricsName[i] == 'FOO' ? 'Fraction of Outliers': metricsName[i];

    renderBoxplot(allSubjects, participantMetrics, metrics[i], "#funcBoxplot"+metricsName[i], chartSize);
  };
}

Tracker.autorun(function() {
  FlowRouter.watchPathChange();
  var currentContext = FlowRouter.current();
  console.log(currentContext);
  if ("path" in currentContext && currentContext.path.startsWith('/showFunctional')){ 
    //navigated to new subject, reset overlays
    // if (Session.get('lastPath') != currentContext.path){
    //   Session.set("showSfs", 'true');
    //   Session.set("showTstd", 'true');
    //   Session.set("showEn", 'true');
    //   Session.set("showGp", 'false');
    // }
    
    showFunctionalImage();
    funcBoxplotTemporal();
    funcBoxplotSpatial();
    Session.set('lastPath', currentContext.path);
  }
});