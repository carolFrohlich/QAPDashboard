import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FunctionalSpatial } from '../api/functional.js';
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
    var base = "/"+ sub +"/"+sess + "/";
    return base + subjectId +"_timeseries-measures.png";
  }
});

Template.showFunctionalPage.events({
  "click input": function(event, template){
    var overlayVal = ""+ $(event.currentTarget).is(':checked');
    var  overlayName = ""+ $(event.currentTarget).val();
    const instance = Template.instance();
    instance.state.set(overlayName, overlayVal);
    showFunctionalImage();
  },
});

Template.showFunctionalPage.onCreated(function anatomicalOnCreated() {
  this.state = new ReactiveDict();
  const instance = Template.instance();
  instance.state.set("showSfs", 'true');
  instance.state.set("showTstd", 'true');
  instance.state.set("showEn", 'true');
  //instance.state.set("showGp", 'true');
});

Template.showFunctionalPage.rendered = function() {
  if(!this._rendered) {
    this._rendered = true;
  }
  funcBoxplot();
  showFunctionalImage();

  this.autorun(function(){
  });
}

showFunctionalImage = function() {
  var subjectId = FlowRouter.getParam("subjectid");
  var sub = subjectId.split('_')[0]
  var sess = subjectId.split('_')[1]
  var scan = subjectId.split('_')[2]
  var base = "/"+ sub +"/"+sess + "/";

  var params = {};
  //add all images in the public directory
  var meanFile = base + subjectId +"_mean-functional.nii.gz";
  params["images"] = [meanFile];

  const instance = Template.instance();
  if(instance.state.get("showSfs") === 'true'){
    var f = base + subjectId +"_SFS.nii.gz";
    params["images"].push(f);
    params[subjectId +"_SFS.nii.gz"] = {lut: "Gold"};
  }
  if(instance.state.get("showTstd") === 'true'){
    var f = base + subjectId +"_temporal-std-map.nii.gz";
    params["images"].push(f);
    params[subjectId +"_temporal-std-map.nii.gz"] = {lut: "Spectrum"};
  }
  if(instance.state.get("showEn") === 'true'){
    var f = base + subjectId +"_estimated-nuisance.nii.gz";
    params["images"].push(f);
    params[subjectId +"_estimated-nuisance.nii.gz"] = {lut: "Fire"};
  }
  if(instance.state.get("showGp") === 'true'){
    var f = base + subjectId +"_grayplot-cluster.nii.gz";
    params["images"].push(f);
    //TODO: create color table for grayplot cluster
    params[subjectId +"_grayplot-cluster.nii.gz"] = {lut: "Green Overlay"};
  }

  papaya.Container.addViewer("funcImageDisplay", params, function(err, params){
                                        console.log('papaya callback', err, params)
                                        });
  papaya.Container.allowPropagation = true;
}

funcBoxplot = function() {
  var subjectId = FlowRouter.getParam("subjectid");
  var sub = subjectId.split('_')[0]

  var metrics = ['EFC', 'FBER', 'FWHM', 'SNR', 'Ghost_y'];
  for (var i = 0; i < metrics.length; i++) {
    var projection = {};
    projection[metrics[i]] = 1;
    projection['_id'] = 0;

    var allSubjects = FunctionalSpatial.find({},{fields:projection}).fetch();
    var participantMetrics = FunctionalSpatial.findOne({'Participant': sub }, {fields:projection});
    var chartSize = ($("#boxplotSpatialContainer").width() / 5);

    renderBoxplot(allSubjects, participantMetrics, metrics[i], "#funcBoxplot"+metrics[i], chartSize);
  };
}